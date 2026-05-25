const skillModel = require("../skills/skillModel")
const sessionModel = require("../sessions/sessionModel")

const mentorDashboard = async (req,res) => {
    let totalSkills = await skillModel.countDocuments({isDeleted: false})
    let totalSessions = await sessionModel.countDocuments({isDeleted: false})
    res.send({
        status : 200,
        success : true,
        message : "Dashboard Data Loaded",
        totalSkills : totalSkills,
        totalSessions : totalSessions
    })
}

module.exports= {
    mentorDashboard
}