import User from "../Schema/User.js";
import Notification from "../Schema/Notification.js";
import bcrypt from "bcrypt";
import { generateUsername, formatDataToSend } from "../utils/utils.js";
import { getAuth } from "firebase-admin/auth";
//import redisClient from "../config/redisClient.js";

let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

const signupController = async (req, res) => {
    let { fullname, email, password } = req.body;

    if (fullname.length < 3) {
        return res
            .status(403)
            .json({ error: "Fullname must be at least 3 letters long" });
    }

    if (!email.length) {
        return res.status(403).json({ error: "Enter email" });
    }

    if (!emailRegex.test(email)) {
        return res.status(403).json({ error: "Email is invalid" });
    }

    if (!passwordRegex.test(password)) {
        return res.status(403).json({
            error:
                "Password should be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letters",
        });
    }

    bcrypt.hash(password, 10, async (err, hashed_password) => {
        let username = await generateUsername(email);
        let user = new User({
            personal_info: {
                fullname,
                email,
                password: hashed_password,
                username,
            },
        });
        user
            .save()
            .then((u) => {
                return res.status(200).json(formatDataToSend(u));
            })
            .catch((err) => {
                if (err.code == 11000) {
                    return res.status(500).json({ error: "Email already exists" });
                }
                return res.status(500).json({ error: err.message });
            });
    });
};

const signinController = async (req, res) => {
    let { email, password } = req.body;

    User.findOne({ "personal_info.email": email })
        .then((user) => {
            if (!user) {
                return res.status(403).json({ error: "Email not found" });
            }

            if (!user.google_auth) {
                bcrypt.compare(password, user.personal_info.password, (err, result) => {
                    if (err) {
                        return res
                            .status(403)
                            .json({ error: "Error occurred while login, Please try again" });
                    }
                    if (!result) {
                        return res.status(403).json({ error: "Incorrect Password" });
                    } else {
                        return res.status(200).json(formatDataToSend(user));
                    }
                });
            } else {
                return res.status(403).json({
                    error:
                        "Account was created using google. Try logging in with google.",
                });
            }
        })
        .catch((err) => {
            console.log(err);
            return res.status(500).json({ error: err.message });
        });
};

const googleauthController = async (req, res) => {
    let { access_token } = req.body;

    getAuth()
        .verifyIdToken(access_token)
        .then(async (decodedUser) => {
            let { email, name, picture } = decodedUser;
            picture = picture.replace("s96-c", "s384-c");

            let user = await User.findOne({ "personal_info.email": email })
                .select(
                    "personal_info.fullname personal_info.username personal_info.profile_img google_auth"
                )
                .catch((err) => {
                    return res.status(500).json({ error: err.message });
                });

            if (user) {
                // Check if the user is signed up via Google
                if (user.google_auth) {
                    // User exists and signed up with Google
                    return res.status(200).json(formatDataToSend(user));
                } else {
                    // User exists but did not sign up via Google
                    return res.status(403).json({
                        error: "This email was signed up without Google. Please log in with a password.",
                    });
                }
            }

            // If user does not exist, create a new one
            let username = await generateUsername(email);
            user = new User({
                personal_info: {
                    fullname: name,
                    email,
                    username,
                },
                google_auth: true,
            });

            await user
                .save()
                .then((u) => {
                    user = u;
                })
                .catch((err) => {
                    return res.status(500).json({ error: err.message });
                });

            return res.status(200).json(formatDataToSend(user));
        })
        .catch((err) => {
            return res.status(500).json({
                error: "Failed to authenticate you with Google. Try with some other Google account",
            });
        });
};

const getProfileController = async (req, res) => {
    const { username } = req.body;
  
    try {
      const user = await User.findOne({ "personal_info.username": username })
        .select("-personal_info.password -google_auth -updatedAt -blogs");
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      return res.status(200).json(user);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
};


const searchUsersController = async (req, res) => {
    const { query } = req.body;

    try {
        // Perform the database query
        const users = await User.find({
            $or: [
                { "personal_info.fullname": new RegExp(query, "i") },
                { "personal_info.username": new RegExp(query, "i") },
            ],
        })
            .select(
                "personal_info.profile_img personal_info.username personal_info.fullname -_id"
            )
            .limit(50);

        // Cache the result for subsequent requests (1 hour)
        //await redisClient.setEx(req.cacheKey, 3600, JSON.stringify({ users }));

        return res.status(200).json({ users });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
};

// Controller for checking if a user has liked a blog
const isLikedByUserController = async (req, res) => {
    let user_id = req.user;  // Get user_id from JWT (already verified by middleware)

    let { _id } = req.body;  // Get the blog ID from request body

    try {
        // Check if a "like" notification exists for the user on the specified blog
        const result = await Notification.exists({ user: user_id, blog: _id, type: "like" });

        // Respond with the result
        return res.status(200).json({ result });
    } catch (err) {
        // Handle errors and send an error response
        return res.status(500).json({ error: err.message });
    }
};

const changePasswordController = async (req, res) => {
    let { currentPassword, newPassword } = req.body;

    if (!passwordRegex.test(newPassword) || !passwordRegex.test(currentPassword)) {
        return res.status(403).json({
            error:
                "Password should be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letters",
        });
    }

    User.findOne({_id: req.user})
    .then((user) => {
        if(user.google_auth){
            return res.status(403).json({ error: "Cannot change password for Google authenticated accounts" });
        }

        bcrypt.compare(currentPassword, user.personal_info.password, (err, result) => {
            if (err) {
                return res
                    .status(403)
                    .json({ error: "Error occurred while changing password, Please try again" });
            }
            if (!result) {
                return res.status(403).json({ error: "Incorrect Password" });
            } else {
                bcrypt.hash(newPassword, 10, async (err, hashed_password) => {
                    user.personal_info.password = hashed_password;
                    await user.save();
                    return res.status(200).json({ message: "Password changed successfully" });
                });
            }
        });
    });

}

const updateProfileImgController = async (req, res) => {
    let { url } = req.body;

    User.findOneAndUpdate({_id: req.user}, {"personal_info.profile_img": url})
    .then(() => {
        return res.status(200).json({ profile_img : url});
    })
    .catch((err) => {
        return res.status(500).json({ error: err.message });
    });
}

const updateProfileController = async (req, res) => {

    let {username, bio, social_links} = req.body;

    let bioLimit = 150;

    if(username.length < 3){
        return res.status(403).json({ error: "Username must be atleast 3 characters long" });
    }

    if(bio.length > bioLimit){
        return res.status(403).json({ error: `Bio must be less than ${bioLimit} characters` });
    }

    let socialLinksArr = Object.keys(social_links);

    try{
        for(let i = 0; i < socialLinksArr.length; i++){
            if(social_links[socialLinksArr[i]].length){

                let hostname = new URL(social_links[socialLinksArr[i]]).hostname;

                if(!hostname.includes(`${socialLinksArr[i]}.com`) && socialLinksArr[i] !== "website"){
                    return res.status(403).json({ error: `${socialLinksArr[i]} link is invalid. You must enter a full link` });  
                }
            }
        }

    } catch(err) {
        return res.status(500).json({ error: "You must provide full social links with http(s) included"});
    }

    let updateObj = {
        "personal_info.username": username,
        "personal_info.bio": bio,
        social_links
    }

    User.findOneAndUpdate({_id: req.user}, updateObj ,{
        runValidators: true,
    })
    .then(() => {
        return res.status(200).json({ username });
    })
    .catch((err) => {
        if(err.code === 11000){
            return res.status(403).json({ error: "Username already exists" });
        }
        return res.status(500).json({ error: err.message });
    });
}

// Use ES Module export
export { 
    signupController,
    signinController, 
    googleauthController, 
    getProfileController, 
    searchUsersController,
    isLikedByUserController,
    changePasswordController,
    updateProfileImgController,
    updateProfileController,
};
