import React from "react";
import { CircularProgress, Box } from "@mui/material";

const Loader = () => (
  <Box
    sx={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999,
    }}
  >
    <CircularProgress size={60} />
  </Box>
);

export default Loader;
