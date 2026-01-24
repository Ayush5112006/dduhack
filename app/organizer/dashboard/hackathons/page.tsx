"use client"

import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { HackathonsList } from "@/components/organizer/hackathons-list"

export default function HackathonsPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar type="organizer" />
      <main className="ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Manage Hackathons</h1>
          <p className="mt-2 text-muted-foreground">
            Create, edit, and manage all your hosted hackathons
          </p>
        </div>
        <HackathonsList />
      </main>
    </div>
  )
}
      setSelectedIds([])
    } else {
      setSelectedIds(filteredHackathons.map(h => h.id))
    }
  }

  const handleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(sid => sid !== id))
    } else {
      setSelectedIds([...selectedIds, id])
    }
  }

  const handleBulkDelete = () => {
    if (confirm(`Delete ${selectedIds.length} selected hackathons?`)) {
      setHackathons(hackathons.filter(h => !selectedIds.includes(h.id)))
      setSelectedIds([])
      alert("Hackathons deleted successfully")
    }
  }

  const handleExportCSV = () => {
    const csv = [
      ["Name", "Status", "Category", "Participants", "Submissions", "Deadline"],
      ...filteredHackathons.map(h => [
        h.name, h.status, h.category, h.participants, h.submissions, h.deadline
      ])
    ].map(row => row.join(",")).join("\n")
    
    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "hackathons.csv"
    a.click()
    alert("Exported successfully!")
  }

  const handleView = (id: string) => {
    router.push(`/hackathons/${id}`)
  }

  const handleEdit = (id: string) => {
    router.push(`/organizer/dashboard/hackathons/${id}/edit`)
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this hackathon?")) {
      setHackathons(hackathons.filter((h) => h.id !== id))
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar type="organizer" />
      <main className="ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">My Hackathons</h1>
          <p className="mt-2 text-muted-foreground">
            View and manage all your hackathons
          </p>
        </div>

        <Card className="border-border bg-card">
          <CardHeader className="space-y-4">
            <div className="flex items-center justify-between">
              <CardTitle>All Hackathons</CardTitle>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleExportCSV}
                  disabled={filteredHackathons.length === 0}
                >
                  Export CSV
                </Button>
                {selectedIds.length > 0 && (
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={handleBulkDelete}
                  >
                    Delete ({selectedIds.length})
                  </Button>
                )}
              </div>
            </div>
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search hackathons..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-secondary pl-9"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-md border border-border bg-secondary px-3 py-2 text-sm"
              >
                <option value="all">All Status</option>
                <option value="Active">Active</option>
                <option value="Draft">Draft</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </CardHeader>
          <CardContent>
            {filteredHackathons.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">No hackathons found.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <input
                        type="checkbox"
                        checked={selectedIds.length === filteredHackathons.length && filteredHackathons.length > 0}
                        onChange={handleSelectAll}
                        className="cursor-pointer"
                      />
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Participants</TableHead>
                    <TableHead>Submissions</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHackathons.map((hackathon) => (
                    <TableRow key={hackathon.id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(hackathon.id)}
                          onChange={() => handleSelectOne(hackathon.id)}
                          className="cursor-pointer"
                        />
                      </TableCell>
                      <TableCell className="font-medium text-foreground">
                        {hackathon.name}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            hackathon.status === "Active"
                              ? "default"
                              : hackathon.status === "Completed"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {hackathon.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {hackathon.category}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {hackathon.participants.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {hackathon.submissions.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {hackathon.deadline}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              className="gap-2"
                              onClick={() => handleView(hackathon.id)}
                            >
                              <Eye className="h-4 w-4" /> View
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="gap-2"
                              onClick={() => handleEdit(hackathon.id)}
                            >
                              <Edit className="h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="gap-2 text-destructive"
                              onClick={() => handleDelete(hackathon.id)}
                            >
                              <Trash2 className="h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
