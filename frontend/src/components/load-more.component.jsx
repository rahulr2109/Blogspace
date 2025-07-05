const LoadMoreDataBtn = ({ state, fetchDataFun }) => {
  // Check if state exists and has the expected structure
  if (state != null && state.results && state.results.blogs) {
    const currentBlogsCount = state.results.blogs.length;
    const totalDocs = state.totalDocs;
    
    // Show button only if there are more blogs to load
    if (totalDocs > currentBlogsCount) {
      return (
        <button
          className="text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-md flex items-center gap-2"
          onClick={() => {
            //console.log(`Loading page ${state.page + 1}`);
            fetchDataFun({ page: state.page + 1 });
          }}
        >
          Load More
        </button>
      );
    }
  }
  
  // Return null if no more data to load (button won't show)
  return null;
};

export default LoadMoreDataBtn;