import Notification from "../Schema/Notification.js";

const newNotificationController = async (req, res) => {
    let user_id = req.user._id;

    Notification.exists({ notification_for: user_id, seen: false, user: { $ne: user_id } })
    .then((result) => {
        if(result){
            return res.status(200).json({ new_notification_available: true });
        } else {
            return res.status(200).json({ new_notification_available: false });
        }
    })
    .catch((err) => {
        console.error(err.message);
        return res.status(500).json({ error: err.message });
    });
}

const notificationController = async (req, res) => {

    let user_id = req.user;

    let { page, filter, deletedDocCount } = req.body;

    let maxLimit = 10;

    let findQuery = { notification_for: user_id, user: { $ne: user_id } };

    let skipDocs = (page - 1) * maxLimit;

    if(filter != "all"){
        findQuery.type = filter;
    }

    if(deletedDocCount){
        skipDocs -= deletedDocCount;
    }

    Notification.find(findQuery)
    .skip(skipDocs)
    .limit(maxLimit)
    .populate("blog", "title blog_id")
    .populate("user", "personal_info.fullname personal_info.username, personal_info.profile_img")
    .populate("comment", "comment")
    .populate("replied_on_comment", "comment")
    .populate("reply", "comment")
    .sort({ createdAt: -1 })
    .select("createdAt type seen reply")
    .then(notification => {
        return res.status(200).json({ notification });
    })
    .catch(err => {
        console.error(err.message);
        return res.status(500).json({ error: err.message });
    });
}

const allNotificationCountController = async (req, res) => {
    let user_id = req.user;

    let {filter} = req.body;

    let findQuery = { notification_for: user_id, user: { $ne: user_id } };

    if(filter != "all"){
        findQuery.type = filter;
    }

    Notification.countDocuments(findQuery)
    .then(count => {
        return res.status(200).json({ count });
    })
    .catch(err => {
        console.error(err.message);
        return res.status(500).json({ error: err.message });
    });
}

export { newNotificationController, notificationController, allNotificationCountController };