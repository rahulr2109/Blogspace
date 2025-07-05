import { useContext, useEffect, useState } from "react";
import axios from "axios";
import {UserContext} from "../App";
import { filterPaginationData } from "../common/filter-pagination-data";
import { use } from "react";
import Loader from "../components/loader.component";
import AnimationWrapper from "../common/page-animation";
import NoDataMessage from "../components/nodata.component";
import NoticificationCard from "../components/notification-card.component";


const NotificationPage = () => {

    let { userAuth : { access_token} } = useContext(UserContext);

    const [filter, setFilter] = useState("all");
    const [notifications, setNotifications] = useState(null);

    let filters = [
        "all",
        "like",
        "comment",
        "reply"]

    const fetchNotifications = async ({page, deletedDocCount = 0}) => {
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/notifications", {page, filter, deletedDocCount}, {
            headers: {
                Authorization: `Bearer ${access_token}`
            }
        })
        .then( async ({data : {notifications : data}}) => {

            let formatedData = await filterPaginationData({
                state : notifications,
                data, page, 
                countRoute : "/api/notification/all-notifications-count",
                data_to_send : {filter},
                user : access_token
            });

            setNotifications(formatedData);

        })
        .catch(err => {
            console.error(err.message);
        });
    }  

    const handleFilter = (e) => {
        let btn = e.target;

        setFilter(btn.innerHTML);

        setNotifications(null);

    }    

    useEffect(() => {

        if(access_token){
            fetchNotifications({page : 1});
        }
    },[filter, access_token]);
        
    return (
        <div>
            <h1 className="max-md:hidden">Recent Notifications</h1>

            <div className="my-8 flex gap-6">
                {
                    filters.map((filterName, i) => {
                        return <button key={i} className={"py-2 " + (filter == filterName ? "btn-dark" : "btn-light")}
                        onClick={handleFilter} >{filterName}</button>
                    })
                }

                <div>

                    {
                        notifications == null ? <Loader /> :
                        <>
                        {
                            notifications.results.length ? 
                            notifications.results.map((notification, i) => {
                                return <AnimationWrapper key={i} transition={{delay: i * 0.08}}>
                                    <NoticificationCard />
                                </AnimationWrapper>
                            })
                            : <NoDataMessage message="Nothing available" />
                     }    
                        </>
                    }

                </div>

            </div>
        </div>
    );
}

export default NotificationPage;