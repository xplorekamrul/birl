"use client";

import { Button } from "@/components/ui/button";
import { Edit2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import BrandForm from "./BrandForm";
import CategoryForm, { type CategoryFormData } from "./CategoryForm";
import { type CategoryItem } from "./CategoryList";
import SuperCategoryForm, { type SuperCategoryFormData } from "./SuperCategoryForm";
import { type SuperCategoryItem } from "./SuperCategoryList";

type BrandItem = { id: string; name: string; slug: string; logoUrl?: string | null };

interface CatalogHierarchyViewProps {
  superCategories: SuperCategoryItem[];
  categories: CategoryItem[];
  brands: BrandItem[];
  onCreateSuperCategory: (data: SuperCategoryFormData) => Promise<void>;
  onUpdateSuperCategory: (id: string, data: SuperCategoryFormData) => Promise<void>;
  onDeleteSuperCategory: (id: string) => Promise<void>;
  onCreateCategory: (data: CategoryFormData) => Promise<void>;
  onUpdateCategory: (id: string, data: CategoryFormData) => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
  onCreateBrand: (data: { name: string; slug: string; logoUrl: string }) => Promise<void>;
  onUpdateBrand: (id: string, data: { name: string; slug: string; logoUrl: string }) => Promise<void>;
  onDeleteBrand: (id: string) => Promise<void>;
  loadingCreateSuperCategory: boolean;
  loadingUpdateSuperCategoryId: string | null;
  loadingDeleteSuperCategoryId: string | null;
  loadingCreateCategory: boolean;
  loadingUpdateCategoryId: string | null;
  loadingDeleteCategoryId: string | null;
  loadingCreateBrand: boolean;
  loadingUpdateBrandId: string | null;
  loadingDeleteBrandId: string | null;
}

export default function CatalogHierarchyView({
  superCategories,
  categories,
  brands,
  onCreateSuperCategory,
  onUpdateSuperCategory,
  onDeleteSuperCategory,
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory,
  onCreateBrand,
  onUpdateBrand,
  onDeleteBrand,
  loadingCreateSuperCategory,
  loadingUpdateSuperCategoryId,
  loadingDeleteSuperCategoryId,
  loadingCreateCategory,
  loadingUpdateCategoryId,
  loadingDeleteCategoryId,
  loadingCreateBrand,
  loadingUpdateBrandId,
  loadingDeleteBrandId,
}: CatalogHierarchyViewProps) {
  // Selection states for hierarchical navigation
  const [selectedSuperCategoryId, setSelectedSuperCategoryId] = useState<string | null>(
    superCategories.length > 0 ? superCategories[0].id : null
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);

  // Modal states
  const [showAddSuperCategoryModal, setShowAddSuperCategoryModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showAddBrandModal, setShowAddBrandModal] = useState(false);
  const [showEditSuperCategoryModal, setShowEditSuperCategoryModal] = useState(false);
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [showEditBrandModal, setShowEditBrandModal] = useState(false);

  // Editing item states
  const [editingSuperCategory, setEditingSuperCategory] = useState<SuperCategoryItem | null>(null);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [editingBrand, setEditingBrand] = useState<BrandItem | null>(null);

  // Filter data for each column
  const filteredCategories = selectedSuperCategoryId
    ? categories.filter((cat) => cat.superCategoryId === selectedSuperCategoryId)
    : [];

  const filteredSubCategories = selectedCategoryId
    ? categories.filter((cat) => cat.parentId === selectedCategoryId)
    : [];

  const filteredBrands = brands;

  return (
    <div className=" h-[calc(100vh-200px)]">
      {/* Column 1: Super Categories */}
      <div className="bg-white rounded-lg border overflow-hidden flex flex-col">
        <div className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
          <h2 className="font-semibold text-sm">Super Categories</h2>
          <Button
            size="sm"
            variant="ghost"
            className="text-white hover:bg-blue-700 h-6 w-6 p-0"
            onClick={() => setShowAddSuperCategoryModal(true)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="p-3">
            {superCategories.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">No super categories</p>
            ) : (
              <div className="grid grid-cols-5 gap-2">
                {superCategories.map((sc) => (
                  <div
                    key={sc.id}
                    onClick={() => {
                      setSelectedSuperCategoryId(sc.id);
                      setSelectedCategoryId(null);
                      setSelectedBrandId(null);
                    }}
                    className={`p-2 rounded cursor-pointer transition flex items-center justify-between group text-xs font-medium ${selectedSuperCategoryId === sc.id
                        ? "bg-blue-100 border border-blue-300"
                        : "bg-slate-100 hover:bg-slate-200"
                      }`}
                  >
                    <span className="truncate">{sc.name}</span>
                    {selectedSuperCategoryId === sc.id && (
                      <div className="flex gap-0.5 ml-1 opacity-0 group-hover:opacity-100 transition">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingSuperCategory(sc);
                            setShowEditSuperCategoryModal(true);
                          }}
                          disabled={loadingUpdateSuperCategoryId === sc.id}
                          className="h-5 w-5 p-0"
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteSuperCategory(sc.id);
                          }}
                          disabled={loadingDeleteSuperCategoryId === sc.id}
                          className="h-5 w-5 p-0"
                        >
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Column 2: Categories (filtered by selected super category) */}
      <div className="bg-white rounded-lg border overflow-hidden flex flex-col">
        <div className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
          <h2 className="font-semibold text-sm">Categories</h2>
          <Button
            size="sm"
            variant="ghost"
            className="text-white hover:bg-blue-700 h-6 w-6 p-0"
            onClick={() => setShowAddCategoryModal(true)}
            disabled={!selectedSuperCategoryId}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="p-3">
            {!selectedSuperCategoryId ? (
              <p className="text-sm text-slate-500 text-center py-4">Select a super category</p>
            ) : filteredCategories.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">No categories</p>
            ) : (
              <div className="grid grid-cols-5 gap-2">
                {filteredCategories.map((cat) => (
                  <div
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategoryId(cat.id);
                      setSelectedBrandId(null);
                    }}
                    className={`p-2 rounded cursor-pointer transition flex items-center justify-between group text-xs font-medium ${selectedCategoryId === cat.id
                        ? "bg-blue-100 border border-blue-300"
                        : "bg-slate-100 hover:bg-slate-200"
                      }`}
                  >
                    <span className="truncate">{cat.name}</span>
                    {selectedCategoryId === cat.id && (
                      <div className="flex gap-0.5 ml-1 opacity-0 group-hover:opacity-100 transition">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingCategory(cat);
                            setShowEditCategoryModal(true);
                          }}
                          disabled={loadingUpdateCategoryId === cat.id}
                          className="h-5 w-5 p-0"
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteCategory(cat.id);
                          }}
                          disabled={loadingDeleteCategoryId === cat.id}
                          className="h-5 w-5 p-0"
                        >
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>


      {/* Column 4: Brands */}
      <div className="bg-white rounded-lg border overflow-hidden flex flex-col">
        <div className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
          <h2 className="font-semibold text-sm">Brands</h2>
          <Button
            size="sm"
            variant="ghost"
            className="text-white hover:bg-blue-700 h-6 w-6 p-0"
            onClick={() => setShowAddBrandModal(true)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="p-3">
            {filteredBrands.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">No brands</p>
            ) : (
              <div className="grid grid-cols-5 gap-2">
                {filteredBrands.map((brand) => (
                  <div
                    key={brand.id}
                    onClick={() => setSelectedBrandId(brand.id)}
                    className={`p-2 rounded cursor-pointer transition flex items-center justify-between group text-xs font-medium ${selectedBrandId === brand.id
                        ? "bg-blue-100 border border-blue-300"
                        : "bg-slate-100 hover:bg-slate-200"
                      }`}
                  >
                    <div className="flex-1 min-w-0 flex items-center gap-1 truncate">
                      {brand.logoUrl && (
                        <img
                          src={brand.logoUrl}
                          alt={brand.name}
                          className="h-5 w-5 rounded object-cover flex-shrink-0"
                        />
                      )}
                      <span className="truncate">{brand.name}</span>
                    </div>
                    {selectedBrandId === brand.id && (
                      <div className="flex gap-0.5 ml-1 opacity-0 group-hover:opacity-100 transition">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingBrand(brand);
                            setShowEditBrandModal(true);
                          }}
                          disabled={loadingUpdateBrandId === brand.id}
                          className="h-5 w-5 p-0"
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteBrand(brand.id);
                          }}
                          disabled={loadingDeleteBrandId === brand.id}
                          className="h-5 w-5 p-0"
                        >
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>



      {/* Add Super Category Modal */}
      {showAddSuperCategoryModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
          onClick={() => setShowAddSuperCategoryModal(false)}
        >
          <div
            className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowAddSuperCategoryModal(false)}
              className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-lg font-semibold mb-4">Add New Super Category</h2>
            <SuperCategoryForm
              onSubmit={async (data) => {
                await onCreateSuperCategory(data);
                setShowAddSuperCategoryModal(false);
              }}
              onCancel={() => setShowAddSuperCategoryModal(false)}
              submitLabel="Add Super Category"
              isLoading={loadingCreateSuperCategory}
            />
          </div>
        </div>
      )}

      {/* Edit Super Category Modal */}
      {showEditSuperCategoryModal && editingSuperCategory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
          onClick={() => setShowEditSuperCategoryModal(false)}
        >
          <div
            className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowEditSuperCategoryModal(false)}
              className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-lg font-semibold mb-4">Edit Super Category</h2>
            <SuperCategoryForm
              initialData={{
                ...editingSuperCategory,
                description: editingSuperCategory.description || "",
                image: editingSuperCategory.image || "",
              }}
              onSubmit={async (data) => {
                await onUpdateSuperCategory(editingSuperCategory.id, data);
                setShowEditSuperCategoryModal(false);
                setEditingSuperCategory(null);
              }}
              onCancel={() => {
                setShowEditSuperCategoryModal(false);
                setEditingSuperCategory(null);
              }}
              submitLabel="Update Super Category"
              isLoading={loadingUpdateSuperCategoryId === editingSuperCategory.id}
            />
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showAddCategoryModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
          onClick={() => setShowAddCategoryModal(false)}
        >
          <div
            className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowAddCategoryModal(false)}
              className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-lg font-semibold mb-4">Add New Category</h2>
            <CategoryForm
              categories={categories}
              superCategories={superCategories}
              initialData={{ superCategoryId: selectedSuperCategoryId || "" }}
              onSubmit={async (data) => {
                await onCreateCategory(data);
                setShowAddCategoryModal(false);
              }}
              onCancel={() => setShowAddCategoryModal(false)}
              submitLabel="Add Category"
              isLoading={loadingCreateCategory}
            />
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {showEditCategoryModal && editingCategory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
          onClick={() => setShowEditCategoryModal(false)}
        >
          <div
            className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowEditCategoryModal(false)}
              className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-lg font-semibold mb-4">Edit Category</h2>
            <CategoryForm
              initialData={{
                ...editingCategory,
                description: editingCategory.description || "",
                image: editingCategory.image || "",
                parentId: editingCategory.parentId || "",
                superCategoryId: editingCategory.superCategoryId || "",
              }}
              categories={categories}
              superCategories={superCategories}
              onSubmit={async (data) => {
                await onUpdateCategory(editingCategory.id, data);
                setShowEditCategoryModal(false);
                setEditingCategory(null);
              }}
              onCancel={() => {
                setShowEditCategoryModal(false);
                setEditingCategory(null);
              }}
              submitLabel="Update Category"
              isLoading={loadingUpdateCategoryId === editingCategory.id}
            />
          </div>
        </div>
      )}

      {/* Add Brand Modal */}
      {showAddBrandModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
          onClick={() => setShowAddBrandModal(false)}
        >
          <div
            className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowAddBrandModal(false)}
              className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-lg font-semibold mb-4">Add New Brand</h2>
            <BrandForm
              onSubmit={async (data) => {
                await onCreateBrand(data);
                setShowAddBrandModal(false);
              }}
              onCancel={() => setShowAddBrandModal(false)}
              submitLabel="Add Brand"
              isLoading={loadingCreateBrand}
            />
          </div>
        </div>
      )}

      {/* Edit Brand Modal */}
      {showEditBrandModal && editingBrand && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
          onClick={() => setShowEditBrandModal(false)}
        >
          <div
            className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowEditBrandModal(false)}
              className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-lg font-semibold mb-4">Edit Brand</h2>
            <BrandForm
              initialData={{
                ...editingBrand,
                logoUrl: editingBrand.logoUrl || "",
              }}
              onSubmit={async (data) => {
                await onUpdateBrand(editingBrand.id, data);
                setShowEditBrandModal(false);
                setEditingBrand(null);
              }}
              onCancel={() => {
                setShowEditBrandModal(false);
                setEditingBrand(null);
              }}
              submitLabel="Update Brand"
              isLoading={loadingUpdateBrandId === editingBrand.id}
            />
          </div>
        </div>
      )}
    </div>
  );
}
