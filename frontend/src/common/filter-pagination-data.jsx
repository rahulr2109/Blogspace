import axios from "axios";

export const filterPaginationData = async ({
  create_new_arr = false,
  state,
  data,
  page,
  countRoute,
  data_to_send = {},
}) => {
  let obj;

  if (state != null && !create_new_arr) {
    obj = { ...state, results: [...state.results, ...data], page: page };
  } else {
    await axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + countRoute, data_to_send)
      .then(({ data: { totalDocs } }) => {
        obj = { results: data, page: page, totalDocs };
      })
      .catch((err) => {
        console.log(err + " from filterPaginationData");
      });
  }

  return obj;
};
