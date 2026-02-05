import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { getPrismaClient } from "@/lib/prisma-multi-db"
import bcrypt from "bcryptjs"
import { sendEmail } from "@/lib/email-service"

/**
 * API Route: Add Mentor
 * POST /api/mentors/add
 * 
 * Allows organizers/admins to add mentors to hackathons
 * Automatically generates password and sends email to mentor
 */
export async function POST(request: NextRequest) {
    try {
        const session = await getSession()

        // Check authentication
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Check authorization - only organizers and admins can add mentors
        if (session.userRole !== "organizer" && session.userRole !== "admin") {
            return NextResponse.json({ error: "Forbidden - Only organizers and admins can add mentors" }, { status: 403 })
        }

        const body = await request.json()
        const { name, email, hackathonId, expertise, bio, linkedIn, github } = body

        // Validate required fields
        if (!name || !email || !hackathonId) {
            return NextResponse.json({
                error: "Missing required fields: name, email, hackathonId"
            }, { status: 400 })
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
        }

        console.log("👤 Adding new mentor:", { name, email, hackathonId })

        const db = getPrismaClient(session.userRole)

        // Check if user already exists
        const existingUser = await db.user.findUnique({
            where: { email }
        })

        let userId: string
        let password: string
        let isNewUser = false

        if (existingUser) {
            // User exists - check if already a mentor
            if (existingUser.role === "mentor") {
                console.log("✅ User already exists as mentor")
                userId = existingUser.id
                password = "" // Don't generate new password for existing users
            } else {
                // Update existing user to mentor role
                console.log("🔄 Updating existing user to mentor role")
                await db.user.update({
                    where: { id: existingUser.id },
                    data: { role: "mentor" }
                })
                userId = existingUser.id
                password = "" // Don't generate new password
            }
        } else {
            // Create new mentor user
            isNewUser = true

            // Generate secure password
            // Format: First 4 letters of name + @ + Last 6 letters of email
            const namePrefix = name.replace(/\s/g, "").substring(0, 4)
            const emailSuffix = email.split("@")[0].slice(-6)
            password = `${namePrefix}@${emailSuffix}`

            console.log("🔐 Generated password for new mentor")

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10)

            // Create new user
            const newUser = await db.user.create({
                data: {
                    email,
                    name,
                    password: hashedPassword,
                    role: "mentor",
                    profile: {
                        create: {
                            bio: bio || "",
                            expertise: expertise || "",
                            linkedin: linkedIn || "",
                            github: github || "",
                        }
                    }
                }
            })

            userId = newUser.id
            console.log("✅ New mentor user created:", userId)
        }

        // Assign mentor to hackathon
        const mentorAssignment = await db.mentor.create({
            data: {
                userId,
                hackathonId,
                expertise: expertise || "",
                bio: bio || "",
                status: "active",
            }
        })

        console.log("✅ Mentor assigned to hackathon:", mentorAssignment.id)

        // Get hackathon details for email
        const hackathon = await db.hackathon.findUnique({
            where: { id: hackathonId },
            select: { title: true, startDate: true, endDate: true }
        })

        // ============================================
        // SEND EMAIL TO MENTOR
        // ============================================
        console.log("📧 Sending email to mentor...")

        const emailSubject = isNewUser
            ? "Welcome as a Mentor - Your Account Details"
            : "You've been added as a Mentor"

        const emailBody = isNewUser ? `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welcome to HackHub as a Mentor! 🎓</h2>
        
        <p>Hi ${name},</p>
        
        <p>You've been added as a mentor for <strong>${hackathon?.title || "a hackathon"}</strong>.</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1f2937;">Your Login Credentials</h3>
          <p style="margin: 10px 0;"><strong>Email/User ID:</strong> ${email}</p>
          <p style="margin: 10px 0;"><strong>Password:</strong> <code style="background-color: #e5e7eb; padding: 4px 8px; border-radius: 4px; font-size: 14px;">${password}</code></p>
        </div>
        
        <div style="background-color: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0;">
          <p style="margin: 0;"><strong>⚠️ Important:</strong> Please change your password after your first login for security.</p>
        </div>
        
        <h3>Hackathon Details:</h3>
        <ul>
          <li><strong>Event:</strong> ${hackathon?.title}</li>
          <li><strong>Start Date:</strong> ${hackathon?.startDate ? new Date(hackathon.startDate).toLocaleDateString() : "TBD"}</li>
          <li><strong>End Date:</strong> ${hackathon?.endDate ? new Date(hackathon.endDate).toLocaleDateString() : "TBD"}</li>
        </ul>
        
        <div style="margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/login" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Login to Dashboard
          </a>
        </div>
        
        <p>As a mentor, you'll be able to:</p>
        <ul>
          <li>Guide and support participants</li>
          <li>Review project submissions</li>
          <li>Provide feedback and mentorship</li>
          <li>Help teams succeed</li>
        </ul>
        
        <p>If you have any questions, please don't hesitate to reach out.</p>
        
        <p>Best regards,<br>
        <strong>HackHub Team</strong></p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="font-size: 12px; color: #6b7280;">
          This is an automated email. Please do not reply to this message.
        </p>
      </div>
    ` : `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">You've been added as a Mentor! 🎓</h2>
        
        <p>Hi ${name},</p>
        
        <p>You've been added as a mentor for <strong>${hackathon?.title || "a hackathon"}</strong>.</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1f2937;">Login Information</h3>
          <p>Please use your existing HackHub account credentials to login.</p>
          <p style="margin: 10px 0;"><strong>Email:</strong> ${email}</p>
        </div>
        
        <h3>Hackathon Details:</h3>
        <ul>
          <li><strong>Event:</strong> ${hackathon?.title}</li>
          <li><strong>Start Date:</strong> ${hackathon?.startDate ? new Date(hackathon.startDate).toLocaleDateString() : "TBD"}</li>
          <li><strong>End Date:</strong> ${hackathon?.endDate ? new Date(hackathon.endDate).toLocaleDateString() : "TBD"}</li>
        </ul>
        
        <div style="margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/login" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Login to Dashboard
          </a>
        </div>
        
        <p>As a mentor, you'll be able to:</p>
        <ul>
          <li>Guide and support participants</li>
          <li>Review project submissions</li>
          <li>Provide feedback and mentorship</li>
          <li>Help teams succeed</li>
        </ul>
        
        <p>Best regards,<br>
        <strong>HackHub Team</strong></p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="font-size: 12px; color: #6b7280;">
          This is an automated email. Please do not reply to this message.
        </p>
      </div>
    `

        try {
            await sendEmail({
                to: email,
                subject: emailSubject,
                html: emailBody,
            })
            console.log("✅ Email sent successfully to:", email)
        } catch (emailError) {
            console.error("❌ Failed to send email:", emailError)
            // Don't fail the request if email fails
            // Mentor is still added, just email notification failed
        }

        // ============================================
        // RETURN SUCCESS RESPONSE
        // ============================================
        return NextResponse.json({
            success: true,
            message: isNewUser
                ? "Mentor added successfully. Login credentials sent via email."
                : "Existing user added as mentor. Notification email sent.",
            data: {
                mentorId: mentorAssignment.id,
                userId,
                name,
                email,
                isNewUser,
                passwordSent: isNewUser,
                hackathonId,
            }
        }, { status: 201 })

    } catch (error) {
        console.error("❌ Error adding mentor:", error)
        return NextResponse.json({
            error: "Failed to add mentor",
            details: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 })
    }
}

/**
 * GET /api/mentors/add
 * Get list of mentors for a hackathon
 */
export async function GET(request: NextRequest) {
    try {
        const session = await getSession()

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const searchParams = request.nextUrl.searchParams
        const hackathonId = searchParams.get("hackathonId")

        if (!hackathonId) {
            return NextResponse.json({ error: "hackathonId required" }, { status: 400 })
        }

        const db = getPrismaClient(session.userRole)

        const mentors = await db.mentor.findMany({
            where: { hackathonId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        profile: true,
                    }
                }
            }
        })

        return NextResponse.json({
            success: true,
            mentors: mentors.map(m => ({
                id: m.id,
                userId: m.userId,
                name: m.user.name,
                email: m.user.email,
                expertise: m.expertise,
                bio: m.bio,
                status: m.status,
                profile: m.user.profile,
            }))
        })

    } catch (error) {
        console.error("Error fetching mentors:", error)
        return NextResponse.json({ error: "Failed to fetch mentors" }, { status: 500 })
    }
}
