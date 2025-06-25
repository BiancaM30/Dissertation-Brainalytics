import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np
from flask import Blueprint, request, jsonify
from torch_geometric.data import Data
from torch_geometric.nn import GCNConv, global_mean_pool
from torch_geometric.utils import add_self_loops

inference_bp = Blueprint('inference', __name__)


def load_timeseries_from_file(file_obj):
    """
    Reads a text file (uploaded via Flask) containing FMRI time-series data.
    Each line should contain 90 numbers separated by whitespace
    """
    content = file_obj.read().decode('utf-8')
    data = []
    for line in content.splitlines():
        row = line.strip().split()
        if row:
            data.append([float(x) for x in row])
    ts_array = np.array(data, dtype=np.float64)
    return ts_array


def compute_corr(timeseries):
    """Compute correlation matrix from the time-series data."""
    corr = np.corrcoef(timeseries.T)
    corr = np.nan_to_num(corr, nan=0.0, posinf=0.0, neginf=-1.0)
    return np.clip(corr, -1.0, 1.0)


def build_graph_from_timeseries(ts, mask):
    """
    Given a time-series array (T x 90) and a mask (90x90), compute the correlation,
    apply the mask, build node features (mean and std for each region),
    and construct a torch_geometric.data.Data object
    """
    n_regions = ts.shape[1]
    corr = compute_corr(ts)
    corr_masked = corr * mask
    corr_masked[corr_masked < 0] = 0
    node_feats = []
    for r in range(n_regions):
        col = ts[:, r]
        mean_ = np.mean(col)
        std_ = np.std(col)
        if std_ < 1e-9:
            std_ = 1e-9
        node_feats.append([mean_, std_])
    x = torch.tensor(node_feats, dtype=torch.float)

    edge_index_list = []
    edge_attr_list = []
    for i in range(n_regions):
        for j in range(n_regions):
            if i != j and mask[i, j] == 1:
                edge_index_list.append([i, j])
                edge_attr_list.append(corr_masked[i, j])
    if len(edge_index_list) == 0:
        e_idx = torch.empty((2, 0), dtype=torch.long)
        e_attr = torch.empty((0,), dtype=torch.float)
    else:
        e_idx = torch.tensor(edge_index_list, dtype=torch.long).t().contiguous()
        e_attr = torch.tensor(edge_attr_list, dtype=torch.float)
    e_idx, e_attr = add_self_loops(e_idx, edge_attr=e_attr, fill_value=0.0, num_nodes=n_regions)
    batch = torch.zeros(x.size(0), dtype=torch.long)
    return Data(x=x, edge_index=e_idx, edge_attr=e_attr, batch=batch)


class GNNClassifier(nn.Module):
    def __init__(self, in_channels=2, hidden_dim=64, num_classes=2):
        super().__init__()
        self.conv1 = GCNConv(in_channels, hidden_dim, normalize=False)
        self.conv2 = GCNConv(hidden_dim, hidden_dim, normalize=False)
        self.fc = nn.Linear(hidden_dim, num_classes)

    def forward(self, data):
        x, edge_index, edge_attr, batch = data.x, data.edge_index, data.edge_attr, data.batch
        x = self.conv1(x, edge_index, edge_weight=edge_attr)
        x = F.relu(x)
        x = self.conv2(x, edge_index, edge_weight=edge_attr)
        x = F.relu(x)
        x = global_mean_pool(x, batch)
        return self.fc(x)


device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

model_path = "app/models/gnn_classifier_cn_ad.pth"
model = GNNClassifier(in_channels=2, hidden_dim=64, num_classes=2).to(device)
model.load_state_dict(torch.load(model_path, map_location=device))
model.eval()
mask_path = "app/models/mask.npy"
mask = np.load(mask_path)


def infer_label(file_obj):
    """
    Given a file object containing FMRI time-series data,
    build the graph, run the model, and return the predicted label
    """
    ts = load_timeseries_from_file(file_obj)
    if ts.ndim != 2 or ts.shape[1] != 90:
        raise ValueError("Invalid timeseries shape; expected (T, 90)")
    graph = build_graph_from_timeseries(ts, mask)
    graph = graph.to(device)
    with torch.no_grad():
        out = model(graph)
        print("Raw model output:", out)
        pred = out.argmax(dim=1).item()
    label_map = {0: "Alzheimer", 1: "Healthy"}
    return label_map.get(pred, "Unknown")


@inference_bp.route('/infer', methods=['POST'])
def infer():
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400
    file = request.files['file']
    try:
        prediction = infer_label(file)
        return jsonify({"label": prediction})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
