import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

export default function BasicButtons() {
  return (
    <>
      <Button variant="text">Text</Button>
      <Button variant="contained">Contained</Button>
      <Typography>السلام عليكم</Typography>
      <Typography sx={{ weight: 700 }}>السلام عليكم</Typography>
      <Button variant="outlined">Outlined</Button>
    </>
  );
}
