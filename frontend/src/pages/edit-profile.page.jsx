import { useEffect, useContext, useState, useRef } from "react";
import axios from "axios";
import { UserContext } from "../App";
import { profileDataStructure } from "./profile.page";
import AnimationWrapper from "../common/page-animation";
import { Toaster, toast } from "react-hot-toast";
import InputBox from "../components/input.component";
import Loader from "../components/loader.component";
import { uploadImageByFile } from "../components/tools.component";
import { storeInSession } from "../common/session";

const EditProfilePage = () => {

    let { userAuth,  userAuth : {access_token}, setUserAuth } = useContext(UserContext);

    let bioLimit = 150;

    let profileImgEle = useRef();
    let editProfileForm = useRef();

    const [profile, setProfile] = useState(profileDataStructure);
    const [loading, setLoading] = useState(true);
    const [charactersLeft, setCharactersLeft] = useState(bioLimit);
    const [updatedProfileImg, setUpdatedProfileImg ] = useState(null);

    let { personal_info : { fullname, username : profile_username, profile_img, email, bio}, social_links} = profile;

    const handleCharacterChange = (e) => {
        setCharactersLeft(bioLimit - e.target.value.length);
    }


    useEffect(() => {
        if(access_token) {
            axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/api/user/get-profile", {username : userAuth.username})
            .then(({data}) => {
                setProfile(data);
                setLoading(false);
            })
            .catch(err => {
                console.log(err);
            });
        }
    }, [access_token]);


    const handleImagePreview = (e) => {

        let img = e.target.files[0];

        profileImgEle.current.src = URL.createObjectURL(img);

        setUpdatedProfileImg(img);
    }

    const handleImageUpload = (e) => {
        e.preventDefault();
    
        if (updatedProfileImg) {
            let loadingToast = toast.loading("Uploading...");
            e.target.setAttribute("disabled", true);
    
            uploadImageByFile(updatedProfileImg)
                .then(({ success, file }) => {
                    if (success && file.url) {
                        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/api/user/update-profile-img", { url : file.url }, {
                            headers: {
                                "Authorization": `Bearer ${access_token}`,
                            },
                        })
                            .then(({ data }) => {
                                let newUserAuth = { ...userAuth, profile_img: data.profile_img };
    
                                storeInSession("user", JSON.stringify(newUserAuth));
                                setUserAuth(newUserAuth);
    
                                setUpdatedProfileImg(null);
    
                                toast.dismiss(loadingToast);
                                e.target.removeAttribute("disabled");
                                toast.success("Profile image updated");
                            })
                            .catch(({ response }) => {
                                toast.dismiss(loadingToast);
                                e.target.removeAttribute("disabled");
                                toast.error(response.data.error || "Failed to update profile image");
                            });
                    } else {
                        throw new Error("Image upload failed");
                    }
                })
                .catch(err => {
                    console.error(err);
                    toast.dismiss(loadingToast);
                    e.target.removeAttribute("disabled");
                    toast.error("Failed to upload image");
                });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        let form = new FormData(editProfileForm.current);

        let formData = {};

        for(let [key, value] of form.entries()) {
            formData[key] = value;
        }

        let { username, bio, instagram, facebook, twitter, linkedin, website } = formData;

        if(username.length < 3) {
            return toast.error("Username must be atleast 3 characters long");
        }

        if(bio.length > bioLimit) {
            return toast.error(`Bio must be less than ${bioLimit} characters`);
        }

        let loadingToast = toast.loading("Updating...");

        e.target.setAttribute("disabled", true);

        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/api/user/update-profile", { username, bio, social_links : { instagram, facebook, twitter, website }}, { headers: { "Authorization": `Bearer ${access_token}` }})
        .then(({data}) => {

            if(userAuth.username != data.username) {
                let newUserAuth = { ...userAuth, username: data.username };

                storeInSession("user", JSON.stringify(newUserAuth));
                setUserAuth(newUserAuth);
            }

            toast.dismiss(loadingToast);
            e.target.removeAttribute("disabled");
            toast.success("Profile updated");
    }).catch(({response}) => {
        toast.dismiss(loadingToast);
        e.target.removeAttribute("disabled");
        toast.error(response.data.error || "Failed to update profile");

    });

    }
    

    return (
        <AnimationWrapper>
            {
                loading ? <Loader /> : (
                    <form ref={editProfileForm}>
                        <Toaster />

                        <h1 className="max-md:hidden">Edit Profile</h1>

                        <div className="flex flex-col lg:flex-row items-start py-10 gap-8 lg:gap-10">

                            <div className="max-lg:center mb-5">
                                <label htmlFor="uploadImg" id="profileImgLable" className=" relative block w-48 h-48 bg-grey rounded-full overflow-hidden">

                                    <div className="w-full h-full absolute top-0 left-0 bg-black/30 opacity-0 hover:opacity-100 text-white text-center flex items-center justify-center cursor-pointer">
                                        Upload Image
                                    </div>

                                    <img ref={profileImgEle} src={profile_img} alt="profile" />
                                </label>

                                <input type="file" className="" id="uploadImg" accept=".jpeg, .png, .jpg" hidden onChange={handleImagePreview} />

                                <button className="btn-light mt-5 max-lg:center lg:w-full px-10" onClick={handleImageUpload} >
                                    Upload
                                </button>
                            </div>

                            <div className="w-full">

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <InputBox name="fullname" type="text" value={fullname} placeholder="Fullname" disable={true} icon="fi-rr-user"  />
                                    </div>

                                    <div>
                                        <InputBox name="email" type="email" value={email} placeholder="Email" disable={true} icon="fi-rr-envelope" />
                                    </div>
                                </div>

                                <InputBox type="text" name="username" value={profile_username} placeholder="Username" icon="fi-rr-at" />

                                <p className="text-dark-grey mt-3">Username will use to search user and will be visible to all users</p>

                                <textarea name="bio" maxLength={bioLimit} defaultValue={bio} className="input-box h-64 lg:h-40 resize-none leading-7 mt-5 pl-5" placeholder="Bio" onChange={handleCharacterChange} ></textarea>

                                <p className="mt-1 text-dark-grey"> {charactersLeft} characters left</p>

                                <p className="my-6 text-darj-grey"> Add your social handles below</p>

                                <div className="md:grid md:grid-cols-2 gap-x-5">

                                    {
                                        Object.keys(social_links).map((key, index) => {

                                            let link = social_links[key];

                                            return <InputBox key={index} type="text" name={key} value={link} placeholder="https://" icon={"fi " +
                  (key != "website" ? "fi-brands-" + key : "fi-rr-globe")} />

                                        })
                                    }
                                </div>

                                <button className="btn-dark w-auto px-10" type="submit" onClick={handleSubmit}>
                                    Update
                                </button>

                            </div>

                        </div>
                    </form>
                )
            }
        </AnimationWrapper>
    );
}

export default EditProfilePage;