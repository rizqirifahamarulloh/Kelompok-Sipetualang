import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Tag, X, Check } from "lucide-react";

export default function CategoryModal({
  isOpen,
  onClose,
  onSuccess,
  editData,
  categoryList,
}) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isEdit = !!editData;

  useEffect(() => {
    setName(editData?.nama_kategori || "");
    setError("");
  }, [editData, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!name.trim()) {
      setError("Category name is required.");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      let updatedData = [];

      if (isEdit) {
        updatedData = categoryList.map((item) =>
          item.id_kategori === editData.id_kategori
            ? {
                ...item,
                nama_kategori: name,
              }
            : item
        );
      } else {
        updatedData = [
          ...categoryList,
          {
            id_kategori: Date.now(),
            nama_kategori: name,
            jumlah_barang: 0,
          },
        ];
      }

      onSuccess(updatedData);

      onClose();

      setLoading(false);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Tag
              size={18}
              className="text-emerald-700"
            />

            {isEdit ? "Edit Category" : "Add Category"}
          </h2>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Category Name
          </label>

          <Input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError("");
            }}
            placeholder="e.g. Tent, Carrier..."
          />

          {error && (
            <p className="text-xs text-red-500 mt-2">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 pb-5">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button
            className="bg-emerald-700 hover:bg-emerald-800 text-white gap-2"
            onClick={handleSave}
          >
            <Check size={15} />

            {loading
              ? "Saving..."
              : isEdit
              ? "Save Changes"
              : "Add Category"}
          </Button>
        </div>
      </div>
    </div>
  );
}