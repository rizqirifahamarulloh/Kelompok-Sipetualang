import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Search,
  Tag,
  Plus,
  Edit,
  Trash2,
  X,
  Layers,
  MoreHorizontal,
  Eye,
} from "lucide-react";

import CategoryModal from "../components/Categories/CategoryModal";
import DeleteCategoryModal from "../components/Categories/DeleteCategoryModal";
import DetailCategoryModal from "../components/Categories/DetailCategoryModal";

export default function Categories() {
  const dummyCategories = [
    {
      id_kategori: 1,
      nama_kategori: "Camping",
      jumlah_barang: 12,
    },
    {
      id_kategori: 2,
      nama_kategori: "Hiking",
      jumlah_barang: 8,
    },
    {
      id_kategori: 3,
      nama_kategori: "Climbing",
      jumlah_barang: 5,
    },
  ];

  const [categoryList, setCategoryList] = useState(dummyCategories);
  const [search, setSearch] = useState("");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [editingItem, setEditingItem] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [deletingItem, setDeletingItem] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [detailItem, setDetailItem] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const filtered = categoryList.filter((c) =>
    c.nama_kategori.toLowerCase().includes(search.toLowerCase())
  );

  const triggerRefresh = (newData) => {
    setCategoryList(newData);
  };

  const handleEditFromDetail = (item) => {
    setIsDetailModalOpen(false);
    setDetailItem(null);

    setEditingItem(item);
    setIsEditModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-sm text-muted-foreground mb-1">
          Dashboard &gt;{" "}
          <span className="text-foreground font-medium">
            Categories
          </span>
        </p>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h1 className="text-2xl font-bold">
            Category Management
          </h1>

          <Button
            className="bg-emerald-700 hover:bg-emerald-800 text-white gap-2"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus size={16} />
            Add Category
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Total Categories
              </p>

              <h2 className="text-3xl font-bold">
                {categoryList.length}
              </h2>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl">
              <Tag
                size={22}
                className="text-emerald-600"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Total Equipment
              </p>

              <h2 className="text-3xl font-bold">
                {categoryList.reduce(
                  (s, c) => s + (c.jumlah_barang || 0),
                  0
                )}
              </h2>
            </div>

            <div className="p-3 bg-blue-50 rounded-xl">
              <Layers
                size={22}
                className="text-blue-600"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        {/* Search */}
        <div className="p-4 border-b flex items-center gap-3 bg-white rounded-t-xl">
          <div className="relative w-full sm:max-w-xs">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={16}
            />

            <Input
              className="pl-9 bg-muted/50"
              placeholder="Search category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {search && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearch("")}
            >
              <X size={16} />
            </Button>
          )}
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="w-12 text-center">
                  No
                </TableHead>

                <TableHead>
                  Category Name
                </TableHead>

                <TableHead className="text-center">
                  Total Equipment
                </TableHead>

                <TableHead className="text-center">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-10 text-muted-foreground"
                  >
                    No categories found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((item, index) => (
                  <TableRow key={item.id_kategori}>
                    <TableCell className="text-center">
                      {index + 1}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                          <Tag
                            size={14}
                            className="text-emerald-600"
                          />
                        </div>

                        <span className="font-medium text-sm">
                          {item.nama_kategori}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="text-center">
                      <Badge variant="outline">
                        {item.jumlah_barang} items
                      </Badge>
                    </TableCell>

                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                          >
                            <MoreHorizontal size={16} />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setDetailItem(item);
                              setIsDetailModalOpen(true);
                            }}
                          >
                            <Eye
                              className="mr-2"
                              size={14}
                            />
                            View Detail
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() => {
                              setEditingItem(item);
                              setIsEditModalOpen(true);
                            }}
                          >
                            <Edit
                              className="mr-2"
                              size={14}
                            />
                            Edit
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => {
                              setDeletingItem(item);
                              setIsDeleteModalOpen(true);
                            }}
                          >
                            <Trash2
                              className="mr-2"
                              size={14}
                            />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="p-4 border-t text-sm text-muted-foreground">
          Showing {filtered.length} of {categoryList.length} categories
        </div>
      </Card>

      {/* Add Modal */}
      <CategoryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={triggerRefresh}
        editData={null}
        categoryList={categoryList}
      />

      {/* Edit Modal */}
      <CategoryModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingItem(null);
        }}
        onSuccess={triggerRefresh}
        editData={editingItem}
        categoryList={categoryList}
      />

      {/* Delete Modal */}
      <DeleteCategoryModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingItem(null);
        }}
        onSuccess={triggerRefresh}
        item={deletingItem}
        categoryList={categoryList}
      />

      {/* Detail Modal */}
      <DetailCategoryModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setDetailItem(null);
        }}
        item={detailItem}
        onEdit={handleEditFromDetail}
      />
    </div>
  );
}