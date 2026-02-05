import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { getPrismaClient } from "@/lib/prisma-multi-db"

/**
 * Admin Database Management API
 * GET /api/admin/database
 * 
 * Allows admins to view all database tables and their data
 */
export async function GET(request: NextRequest) {
    try {
        const session = await getSession()

        // Check authentication
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Check authorization - only admins
        if (session.userRole !== "admin") {
            return NextResponse.json({
                error: "Forbidden - Admin access required"
            }, { status: 403 })
        }

        const searchParams = request.nextUrl.searchParams
        const table = searchParams.get("table")
        const page = parseInt(searchParams.get("page") || "1")
        const limit = parseInt(searchParams.get("limit") || "50")
        const skip = (page - 1) * limit

        console.log("📊 Admin database access:", { table, page, limit })

        const db = getPrismaClient("admin")

        // If no table specified, return list of all tables with counts
        if (!table) {
            const [
                usersCount,
                hackathonsCount,
                registrationsCount,
                submissionsCount,
                teamsCount,
                mentorsCount,
                certificatesCount,
                notificationsCount,
            ] = await Promise.all([
                db.user.count(),
                db.hackathon.count(),
                db.registration.count(),
                db.submission.count(),
                db.team.count(),
                db.mentor.count(),
                db.certificate.count(),
                db.notification.count(),
            ])

            return NextResponse.json({
                success: true,
                tables: [
                    { name: "users", count: usersCount, description: "All user accounts" },
                    { name: "hackathons", count: hackathonsCount, description: "All hackathon events" },
                    { name: "registrations", count: registrationsCount, description: "Hackathon registrations" },
                    { name: "submissions", count: submissionsCount, description: "Project submissions" },
                    { name: "teams", count: teamsCount, description: "Participant teams" },
                    { name: "mentors", count: mentorsCount, description: "Mentor assignments" },
                    { name: "certificates", count: certificatesCount, description: "Issued certificates" },
                    { name: "notifications", count: notificationsCount, description: "User notifications" },
                ]
            })
        }

        // Fetch data for specific table
        let data: any[] = []
        let total = 0

        switch (table.toLowerCase()) {
            case "users":
                [data, total] = await Promise.all([
                    db.user.findMany({
                        skip,
                        take: limit,
                        include: {
                            profile: true,
                            _count: {
                                select: {
                                    registrations: true,
                                    submissions: true,
                                    teams: true,
                                }
                            }
                        },
                        orderBy: { createdAt: "desc" }
                    }),
                    db.user.count()
                ])
                break

            case "hackathons":
                [data, total] = await Promise.all([
                    db.hackathon.findMany({
                        skip,
                        take: limit,
                        include: {
                            organizer: {
                                select: { id: true, name: true, email: true }
                            },
                            _count: {
                                select: {
                                    registrations: true,
                                    submissions: true,
                                    mentors: true,
                                }
                            }
                        },
                        orderBy: { createdAt: "desc" }
                    }),
                    db.hackathon.count()
                ])
                break

            case "registrations":
                [data, total] = await Promise.all([
                    db.registration.findMany({
                        skip,
                        take: limit,
                        include: {
                            user: {
                                select: { id: true, name: true, email: true }
                            },
                            hackathon: {
                                select: { id: true, title: true, status: true }
                            },
                            team: {
                                select: { id: true, name: true }
                            }
                        },
                        orderBy: { createdAt: "desc" }
                    }),
                    db.registration.count()
                ])
                break

            case "submissions":
                [data, total] = await Promise.all([
                    db.submission.findMany({
                        skip,
                        take: limit,
                        include: {
                            user: {
                                select: { id: true, name: true, email: true }
                            },
                            hackathon: {
                                select: { id: true, title: true }
                            },
                            team: {
                                select: { id: true, name: true }
                            },
                            scores: true,
                        },
                        orderBy: { createdAt: "desc" }
                    }),
                    db.submission.count()
                ])
                break

            case "teams":
                [data, total] = await Promise.all([
                    db.team.findMany({
                        skip,
                        take: limit,
                        include: {
                            leader: {
                                select: { id: true, name: true, email: true }
                            },
                            hackathon: {
                                select: { id: true, title: true }
                            },
                            _count: {
                                select: { members: true }
                            }
                        },
                        orderBy: { createdAt: "desc" }
                    }),
                    db.team.count()
                ])
                break

            case "mentors":
                [data, total] = await Promise.all([
                    db.mentor.findMany({
                        skip,
                        take: limit,
                        include: {
                            user: {
                                select: { id: true, name: true, email: true }
                            },
                            hackathon: {
                                select: { id: true, title: true }
                            }
                        },
                        orderBy: { createdAt: "desc" }
                    }),
                    db.mentor.count()
                ])
                break

            case "certificates":
                [data, total] = await Promise.all([
                    db.certificate.findMany({
                        skip,
                        take: limit,
                        include: {
                            user: {
                                select: { id: true, name: true, email: true }
                            },
                            hackathon: {
                                select: { id: true, title: true }
                            }
                        },
                        orderBy: { issuedAt: "desc" }
                    }),
                    db.certificate.count()
                ])
                break

            case "notifications":
                [data, total] = await Promise.all([
                    db.notification.findMany({
                        skip,
                        take: limit,
                        include: {
                            user: {
                                select: { id: true, name: true, email: true }
                            }
                        },
                        orderBy: { createdAt: "desc" }
                    }),
                    db.notification.count()
                ])
                break

            default:
                return NextResponse.json({
                    error: "Invalid table name"
                }, { status: 400 })
        }

        return NextResponse.json({
            success: true,
            table,
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasNext: page * limit < total,
                hasPrev: page > 1,
            }
        })

    } catch (error) {
        console.error("❌ Admin database access error:", error)
        return NextResponse.json({
            error: "Failed to fetch database data",
            details: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 })
    }
}

/**
 * Update database record
 * PUT /api/admin/database
 */
export async function PUT(request: NextRequest) {
    try {
        const session = await getSession()

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        if (session.userRole !== "admin") {
            return NextResponse.json({
                error: "Forbidden - Admin access required"
            }, { status: 403 })
        }

        const body = await request.json()
        const { table, id, data: updateData } = body

        if (!table || !id || !updateData) {
            return NextResponse.json({
                error: "Missing required fields: table, id, data"
            }, { status: 400 })
        }

        console.log("✏️ Admin updating:", { table, id })

        const db = getPrismaClient("admin")
        let result: any

        switch (table.toLowerCase()) {
            case "users":
                result = await db.user.update({
                    where: { id },
                    data: updateData,
                    include: { profile: true }
                })
                break

            case "hackathons":
                result = await db.hackathon.update({
                    where: { id },
                    data: updateData
                })
                break

            case "registrations":
                result = await db.registration.update({
                    where: { id },
                    data: updateData
                })
                break

            case "submissions":
                result = await db.submission.update({
                    where: { id },
                    data: updateData
                })
                break

            case "teams":
                result = await db.team.update({
                    where: { id },
                    data: updateData
                })
                break

            case "mentors":
                result = await db.mentor.update({
                    where: { id },
                    data: updateData
                })
                break

            case "certificates":
                result = await db.certificate.update({
                    where: { id },
                    data: updateData
                })
                break

            case "notifications":
                result = await db.notification.update({
                    where: { id },
                    data: updateData
                })
                break

            default:
                return NextResponse.json({
                    error: "Invalid table name"
                }, { status: 400 })
        }

        console.log("✅ Record updated successfully")

        return NextResponse.json({
            success: true,
            message: "Record updated successfully",
            data: result
        })

    } catch (error) {
        console.error("❌ Admin update error:", error)
        return NextResponse.json({
            error: "Failed to update record",
            details: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 })
    }
}

/**
 * Delete database record
 * DELETE /api/admin/database
 */
export async function DELETE(request: NextRequest) {
    try {
        const session = await getSession()

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        if (session.userRole !== "admin") {
            return NextResponse.json({
                error: "Forbidden - Admin access required"
            }, { status: 403 })
        }

        const searchParams = request.nextUrl.searchParams
        const table = searchParams.get("table")
        const id = searchParams.get("id")

        if (!table || !id) {
            return NextResponse.json({
                error: "Missing required parameters: table, id"
            }, { status: 400 })
        }

        console.log("🗑️ Admin deleting:", { table, id })

        const db = getPrismaClient("admin")

        switch (table.toLowerCase()) {
            case "users":
                await db.user.delete({ where: { id } })
                break

            case "hackathons":
                await db.hackathon.delete({ where: { id } })
                break

            case "registrations":
                await db.registration.delete({ where: { id } })
                break

            case "submissions":
                await db.submission.delete({ where: { id } })
                break

            case "teams":
                await db.team.delete({ where: { id } })
                break

            case "mentors":
                await db.mentor.delete({ where: { id } })
                break

            case "certificates":
                await db.certificate.delete({ where: { id } })
                break

            case "notifications":
                await db.notification.delete({ where: { id } })
                break

            default:
                return NextResponse.json({
                    error: "Invalid table name"
                }, { status: 400 })
        }

        console.log("✅ Record deleted successfully")

        return NextResponse.json({
            success: true,
            message: "Record deleted successfully"
        })

    } catch (error) {
        console.error("❌ Admin delete error:", error)
        return NextResponse.json({
            error: "Failed to delete record",
            details: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 })
    }
}
