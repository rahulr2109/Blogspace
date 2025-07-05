import axios from "axios";

export const filterPaginationData = async ({
  create_new_arr = false,
  state,
  data,
  page,
  countRoute,
  data_to_send = {},
  user = undefined,
}) => {
  let obj;

  let headers = {};

  if(user){
    headers = {
      headers: {
        Authorization: `Bearer ${user}`
      }
    }
  }

  if (state != null && !create_new_arr) {
    // For load more functionality - append new data to existing
    obj = { 
      ...state, 
      results: {
        ...state.results,
        blogs: [...state.results.blogs, ...(data.blogs || data)] // Handle both data.blogs and direct data array
      }, 
      page: page 
    };
  } else {
    // For initial load - get total count and create new structure
    try {
      const { data: { totalDocs } } = await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + countRoute, 
        data_to_send, 
        headers
      );
      
      obj = { 
        results: {
          blogs: data.blogs || data // Handle both data.blogs and direct data array
        }, 
        page: page, 
        totalDocs 
      };
      
      //console.log("Created new pagination object:", obj);
    } catch (err) {
      //console.error("Error in filterPaginationData:", err);
      // Return a default structure on error
      obj = { 
        results: {
          blogs: []
        }, 
        page: 1, 
        totalDocs: 0 
      };
    }
  }

  return obj;
};