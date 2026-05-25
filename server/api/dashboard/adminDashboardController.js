const skillModel = require("../skills/skillModel")
const learnerMentorModel = require("../learnerMentor/learnerMentorModel")
const sessionModel = require("../sessions/sessionModel")
const requestModel = require("../request/requestModel")

const adminDashboard = async (req,res) => {
    try {
        const [
            totalSkills,
            totalLearnerMentor,
            totalSessions,
            activeSwaps,
            mentors
        ] = await Promise.all([
            skillModel.countDocuments({ isDeleted: false }),
            learnerMentorModel.countDocuments({ isDeleted: false }),
            sessionModel.countDocuments({ isDeleted: false }),
            requestModel.countDocuments({ isDeleted: false, isBlocked: false, status: "accepted" }),
            sessionModel.distinct("mentorId", { isDeleted: false, mentorId: { $ne: null } })
        ])

        const totalMentors = mentors.length

        res.send({
            status : 200,
            success : true,
            message : "Dashboard Data Loaded",
            totalSkills,
            totalLearnerMentor,
            totalMentors,
            totalSessions,
            activeSwaps,
            data: {
                totalSkills,
                totalUsers: totalLearnerMentor,
                totalMentors,
                totalSessions,
                activeSwaps
            }
        })
    } catch (err) {
        res.send({
            status: 500,
            success: false,
            message: err.message
        })
    }
}

module.exports= {
    adminDashboard
}
