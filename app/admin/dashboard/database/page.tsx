"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Database, Edit, Trash2, Search, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react"
import { toast } from "sonner"

interface TableInfo {
    name: string
    count: number
    description: string
}

interface PaginationInfo {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
}

export default function AdminDatabasePage() {
    const [tables, setTables] = useState<TableInfo[]>([])
    const [selectedTable, setSelectedTable] = useState<string | null>(null)
    const [tableData, setTableData] = useState<any[]>([])
    const [pagination, setPagination] = useState<PaginationInfo | null>(null)
    const [loading, setLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [editingRecord, setEditingRecord] = useState<any>(null)
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [editFormData, setEditFormData] = useState<any>({})

    // Fetch list of tables
    useEffect(() => {
        fetchTables()
    }, [])

    const fetchTables = async () => {
        try {
            setLoading(true)
            const response = await fetch("/api/admin/database")
            const data = await response.json()

            if (data.success) {
                setTables(data.tables)
            } else {
                toast.error(data.error || "Failed to fetch tables")
            }
        } catch (error) {
            toast.error("Failed to fetch database tables")
        } finally {
            setLoading(false)
        }
    }

    // Fetch table data
    const fetchTableData = async (tableName: string, page: number = 1) => {
        try {
            setLoading(true)
            const response = await fetch(`/api/admin/database?table=${tableName}&page=${page}&limit=20`)
            const data = await response.json()

            if (data.success) {
                setTableData(data.data)
                setPagination(data.pagination)
                setSelectedTable(tableName)
            } else {
                toast.error(data.error || "Failed to fetch table data")
            }
        } catch (error) {
            toast.error("Failed to fetch table data")
        } finally {
            setLoading(false)
        }
    }

    // Open edit dialog
    const handleEdit = (record: any) => {
        setEditingRecord(record)
        setEditFormData({ ...record })
        setEditDialogOpen(true)
    }

    // Update record
    const handleUpdate = async () => {
        if (!selectedTable || !editingRecord) return

        try {
            setLoading(true)
            const response = await fetch("/api/admin/database", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    table: selectedTable,
                    id: editingRecord.id,
                    data: editFormData,
                }),
            })

            const data = await response.json()

            if (data.success) {
                toast.success("Record updated successfully")
                setEditDialogOpen(false)
                fetchTableData(selectedTable, pagination?.page || 1)
            } else {
                toast.error(data.error || "Failed to update record")
            }
        } catch (error) {
            toast.error("Failed to update record")
        } finally {
            setLoading(false)
        }
    }

    // Delete record
    const handleDelete = async (record: any) => {
        if (!selectedTable) return

        if (!confirm(`Are you sure you want to delete this ${selectedTable} record?`)) {
            return
        }

        try {
            setLoading(true)
            const response = await fetch(`/api/admin/database?table=${selectedTable}&id=${record.id}`, {
                method: "DELETE",
            })

            const data = await response.json()

            if (data.success) {
                toast.success("Record deleted successfully")
                fetchTableData(selectedTable, pagination?.page || 1)
            } else {
                toast.error(data.error || "Failed to delete record")
            }
        } catch (error) {
            toast.error("Failed to delete record")
        } finally {
            setLoading(false)
        }
    }

    // Get table columns
    const getTableColumns = (tableName: string): string[] => {
        const columnMap: Record<string, string[]> = {
            users: ["id", "name", "email", "role", "createdAt"],
            hackathons: ["id", "title", "status", "startDate", "endDate", "mode"],
            registrations: ["id", "userId", "hackathonId", "status", "mode", "createdAt"],
            submissions: ["id", "title", "userId", "hackathonId", "status", "createdAt"],
            teams: ["id", "name", "hackathonId", "leaderId", "status"],
            mentors: ["id", "userId", "hackathonId", "expertise", "status"],
            certificates: ["id", "userId", "hackathonId", "type", "issuedAt"],
            notifications: ["id", "userId", "title", "message", "read", "createdAt"],
        }
        return columnMap[tableName] || []
    }

    // Filter data based on search
    const filteredData = tableData.filter((record) => {
        if (!searchTerm) return true
        const searchLower = searchTerm.toLowerCase()
        return Object.values(record).some((value) =>
            String(value).toLowerCase().includes(searchLower)
        )
    })

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Database className="h-8 w-8" />
                        Database Management
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        View and manage all database tables
                    </p>
                </div>
                <Button onClick={fetchTables} variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                </Button>
            </div>

            {/* Tables Overview */}
            {!selectedTable && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {tables.map((table) => (
                        <Card
                            key={table.name}
                            className="cursor-pointer hover:shadow-lg transition-shadow"
                            onClick={() => fetchTableData(table.name)}
                        >
                            <CardHeader>
                                <CardTitle className="capitalize">{table.name}</CardTitle>
                                <CardDescription>{table.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-primary">
                                    {table.count.toLocaleString()}
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">Total records</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Table Data View */}
            {selectedTable && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="capitalize flex items-center gap-2">
                                    {selectedTable}
                                    <Badge variant="secondary">{pagination?.total || 0} records</Badge>
                                </CardTitle>
                                <CardDescription>
                                    Viewing and managing {selectedTable} data
                                </CardDescription>
                            </div>
                            <Button onClick={() => setSelectedTable(null)} variant="outline">
                                Back to Tables
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Search */}
                        <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search records..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        {/* Data Table */}
                        <div className="border rounded-lg overflow-hidden">
                            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            {getTableColumns(selectedTable).map((column) => (
                                                <TableHead key={column} className="capitalize">
                                                    {column}
                                                </TableHead>
                                            ))}
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loading ? (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={getTableColumns(selectedTable).length + 1}
                                                    className="text-center py-8"
                                                >
                                                    Loading...
                                                </TableCell>
                                            </TableRow>
                                        ) : filteredData.length === 0 ? (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={getTableColumns(selectedTable).length + 1}
                                                    className="text-center py-8 text-muted-foreground"
                                                >
                                                    No records found
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredData.map((record) => (
                                                <TableRow key={record.id}>
                                                    {getTableColumns(selectedTable).map((column) => (
                                                        <TableCell key={column} className="max-w-xs truncate">
                                                            {typeof record[column] === "object"
                                                                ? JSON.stringify(record[column])
                                                                : record[column]?.toString() || "-"}
                                                        </TableCell>
                                                    ))}
                                                    <TableCell className="text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleEdit(record)}
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="destructive"
                                                                onClick={() => handleDelete(record)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>

                        {/* Pagination */}
                        {pagination && (
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">
                                    Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
                                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                                    {pagination.total} records
                                </p>
                                <div className="flex items-center gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => fetchTableData(selectedTable, pagination.page - 1)}
                                        disabled={!pagination.hasPrev || loading}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        Previous
                                    </Button>
                                    <span className="text-sm">
                                        Page {pagination.page} of {pagination.totalPages}
                                    </span>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => fetchTableData(selectedTable, pagination.page + 1)}
                                        disabled={!pagination.hasNext || loading}
                                    >
                                        Next
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Record</DialogTitle>
                        <DialogDescription>
                            Make changes to the {selectedTable} record
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        {editingRecord &&
                            Object.keys(editingRecord).map((key) => {
                                if (key === "id" || key === "createdAt" || key === "updatedAt") {
                                    return null
                                }
                                return (
                                    <div key={key} className="space-y-2">
                                        <label className="text-sm font-medium capitalize">{key}</label>
                                        <Input
                                            value={editFormData[key] || ""}
                                            onChange={(e) =>
                                                setEditFormData({ ...editFormData, [key]: e.target.value })
                                            }
                                            placeholder={`Enter ${key}`}
                                        />
                                    </div>
                                )
                            })}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdate} disabled={loading}>
                            {loading ? "Updating..." : "Update"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
