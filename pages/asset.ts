import { getPageContentHTML } from "../utils.js";
import { state } from "../state.js";
import { renderModal, closeModal, ModalButton } from "../components/modal.js";
import { Asset } from "../types.js";

export const renderAssetsPage = () => {
  const controls = `<button id="add-asset-btn" class="btn btn-primary"><i class="fa-solid fa-plus"></i> ADD NEW ASSET</button>`;

  const statusClass = (status: string) => {
    return status.toLowerCase().replace(" ", "");
  };

  const tableRows = state.assets
    .map(
      (asset) => `
        <tr>
            <td>${asset.id}</td>
            <td>${asset.name}</td>
            <td>${asset.serialNo}</td>
            <td>${asset.category}</td>
            <td>${asset.assignedTo || "-"}</td>
            <td>${asset.employeeId || "-"}</td>
            <td>${asset.assignedOn || "-"}</td>
            <td>${asset.location}</td>
            <td><span class="status-badge ${statusClass(asset.status)}">${
        asset.status
      }</span></td>
            <td class="actions-cell">
                <button class="icon-btn action-btn edit edit-asset-btn" data-id="${
                  asset.id
                }" title="Edit"><i class="fa-solid fa-pen-to-square"></i></button>
                <button class="icon-btn action-btn delete delete-asset-btn" data-id="${
                  asset.id
                }" title="Delete"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>
    `
    )
    .join("");

  const content = `
        <div class="card">
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Asset ID</th>
                            <th>Asset Name</th>
                            <th>Serial No</th>
                            <th>Category</th>
                            <th>Assigned To</th>
                            <th>Employee ID</th>
                            <th>Assigned On</th>
                            <th>Location</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${
                          tableRows ||
                          `<tr><td colspan="10" class="placeholder-text">No assets found. Click ADD NEW ASSET to add one.</td></tr>`
                        }
                    </tbody>
                </table>
            </div>
        </div>
    `;
  document.getElementById("app-content")!.innerHTML = getPageContentHTML(
    "Assets",
    content,
    controls
  );
};

export const showAssetModal = (assetId?: string) => {
  const isEditMode = Boolean(assetId);
  const asset = isEditMode ? state.assets.find((a) => a.id === assetId) : null;

  const formHTML = `
        <form id="modal-form" data-id="${assetId || ""}">
            <div class="form-grid-2-col">
                <div class="form-group">
                    <label for="assetName">Asset Name</label>
                    <input type="text" id="assetName" required placeholder="e.g., Dell XPS 15 Laptop" value="${
                      asset?.name || ""
                    }">
                </div>
                <div class="form-group">
                    <label for="serialNo">Serial No</label>
                    <input type="text" id="serialNo" required placeholder="e.g., DXPS15-12345" value="${
                      asset?.serialNo || ""
                    }">
                </div>
                <div class="form-group">
                    <label for="assetCategory">Category</label>
                    <select id="assetCategory" required ${
                      isEditMode ? "disabled" : ""
                    }>
                        <option value="">Select a category</option>
                        <option ${
                          asset?.category === "Laptop" ? "selected" : ""
                        }>Laptop</option>
                        <option ${
                          asset?.category === "Monitor" ? "selected" : ""
                        }>Monitor</option>
                        <option ${
                          asset?.category === "Charger" ? "selected" : ""
                        }>Charger</option>
                        <option ${
                          asset?.category === "Keyboard" ? "selected" : ""
                        }>Keyboard</option>
                        <option ${
                          asset?.category === "Headset" ? "selected" : ""
                        }>Headset</option>
                        <option ${
                          asset?.category === "Accessory" ? "selected" : ""
                        }>Accessory</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="assetLocation">Location</label>
                    <input type="text" id="assetLocation" required placeholder="e.g., New York" value="${
                      asset?.location || ""
                    }">
                </div>
                <div class="form-group">
                    <label for="assetStatus">Status</label>
                    <select id="assetStatus">
                        <option ${
                          asset?.status === "In Use" ? "selected" : ""
                        }>In Use</option>
                        <option ${
                          asset?.status === "Not Use" ? "selected" : ""
                        }>Not Use</option>
                        <option ${
                          asset?.status === "Repair" ? "selected" : ""
                        }>Repair</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="assignedOn">Assigned On</label>
                    <input type="date" id="assignedOn" value="${
                      asset?.assignedOn || ""
                    }">
                </div>
                <div class="form-group">
                    <label for="assignedTo">Assigned To</label>
                    <input type="text" id="assignedTo" placeholder="e.g., Vigneshraja S" value="${
                      asset?.assignedTo || ""
                    }">
                </div>
                <div class="form-group">
                    <label for="employeeId">Employee ID</label>
                    <input type="text" id="employeeId" placeholder="e.g., EMP001" value="${
                      asset?.employeeId || ""
                    }">
                </div>
            </div>
        </form>
    `;

  const buttons: ModalButton[] = [
    {
      id: "cancel-asset-btn",
      text: "Cancel",
      className: "btn-secondary",
      type: "button",
    },
    {
      id: "save-asset-btn",
      text: isEditMode ? "Update" : "Save",
      className: "btn-primary",
      type: "submit",
    },
  ];

  // The form is now part of the bodyHTML
  const modalBody = `
        <form id="modal-form" data-id="${assetId || ""}">
            ${formHTML.substring(
              formHTML.indexOf("<div"),
              formHTML.lastIndexOf("</div>") + 6
            )}
        </form>
    `;

  renderModal(isEditMode ? "Edit Asset" : "Add New Asset", modalBody, buttons);
  // Manually attach form to modal body since renderModal doesn't handle nested forms well
  const modalBodyEl = document.querySelector(".modal-body");
  if (modalBodyEl) {
    modalBodyEl.innerHTML = formHTML.substring(
      formHTML.indexOf("<div"),
      formHTML.lastIndexOf("</div>") + 6
    );
    (modalBodyEl.parentNode as HTMLElement).id = "modal-form";
    (modalBodyEl.parentNode as HTMLElement).setAttribute(
      "data-id",
      assetId || ""
    );
  }
};

export const handleSaveAsset = (e: SubmitEvent) => {
  e.preventDefault();
  const form = e.target as HTMLFormElement;
  const assetId = form.dataset.id;
  const isEditMode = Boolean(assetId);

  const category = (
    document.getElementById("assetCategory") as HTMLSelectElement
  ).value;
  if (!category) {
    alert("Please select a category.");
    return;
  }

  const assetData = {
    name: (document.getElementById("assetName") as HTMLInputElement).value,
    serialNo: (document.getElementById("serialNo") as HTMLInputElement).value,
    category: category,
    location: (document.getElementById("assetLocation") as HTMLInputElement)
      .value,
    status: (document.getElementById("assetStatus") as HTMLSelectElement).value,
    assignedTo: (document.getElementById("assignedTo") as HTMLInputElement)
      .value,
    employeeId: (document.getElementById("employeeId") as HTMLInputElement)
      .value,
    assignedOn: (document.getElementById("assignedOn") as HTMLInputElement)
      .value,
  };

  if (isEditMode) {
    const assetIndex = state.assets.findIndex((a) => a.id === assetId);
    if (assetIndex > -1) {
      state.assets[assetIndex] = { ...state.assets[assetIndex], ...assetData };
    }
  } else {
    const categoryPrefixMap: { [key: string]: string } = {
      Laptop: "LP",
      Monitor: "MO",
      Charger: "CH",
      Keyboard: "KB",
      Headset: "HS",
      Accessory: "AC",
    };
    const prefix = categoryPrefixMap[category] || "GEN";
    const categoryCount = state.assets.filter(
      (asset) => asset.category === category
    ).length;
    const newId = `${prefix}-${categoryCount + 1}`;

    const newAsset: Asset = { ...assetData, id: newId };
    state.assets.push(newAsset);
  }

  closeModal();
  renderAssetsPage();
};

export const showDeleteConfirmModal = (assetId: string) => {
  const asset = state.assets.find((a) => a.id === assetId);
  if (!asset) return;

  const bodyHTML = `<p>Are you sure you want to delete the asset: <strong>${asset.name} (${asset.id})</strong>? This action cannot be undone.</p>`;
  const buttons: ModalButton[] = [
    {
      id: "cancel-delete-btn",
      text: "Cancel",
      className: "btn-secondary",
      type: "button",
    },
    {
      id: "confirm-delete-btn",
      text: "Delete",
      className: "btn-danger",
      type: "button",
      dataId: assetId,
    },
  ];

  renderModal("Confirm Deletion", bodyHTML, buttons);
};

export const handleDeleteAsset = (assetId: string) => {
  state.assets = state.assets.filter((a) => a.id !== assetId);
  closeModal();
  renderAssetsPage();
};
