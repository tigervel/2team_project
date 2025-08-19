import { Box, Button, Grid, IconButton, Modal, Paper, TextField, Typography } from "@mui/material"
import { useEffect, useState } from "react";



const MainFeesUtil = (tno) => {
    const [open, setOpen] = useState(false);

    const [formData, setFormData] = useState({
        tno: tno??"",
        image: null,
        preview: null
    });

    useEffect(() => {
    setFormData(prev => ({ ...prev, tno: tno ?? "" }));
  }, [tno]);


    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleChange = (field) => (e) => {
        setFormData(prev => ({ ...prev, [field]: e.target.value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                image: file,
                preview: URL.createObjectURL(file)
            }));
        }
    };

    return (
        <>  <Grid item>
            <Paper onClick={() => handleOpen(tno)} sx={{
                 border: '2px dashed #ccc', borderRadius: 2,
                display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer'
            }}>
                <Typography variant="h4">＋</Typography>
            </Paper>
        </Grid>
            <Modal open={open} onClose={handleClose}>
                <Box sx={{
                    p: 4, bgcolor: '#fff', borderRadius: 2, width: '90%', maxWidth: 1000, mx: 'auto', mt: '5%', position: 'relative'
                }}>
                    <IconButton onClick={handleClose} sx={{ position: 'absolute', top: 12, right: 12 }}>
                    </IconButton>
                    <Typography variant="h6" mb={3}>차량 정보 입력</Typography>
                    <Box display="flex" gap={4} flexDirection={{ xs: 'column', md: 'row' }}>
                        <Box sx={{ flex: 1, bgcolor: '#e5e7eb', aspectRatio: '5/3', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 1 }}>
                            <img
                                src={formData.preview || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="500" height="300"><rect width="100%" height="100%" fill="%23d1d5db"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%236b7280" font-size="24" font-family="sans-serif">No Image</text></svg>'}
                                alt="preview"
                                style={{
                                    width: 'auto',
                                    height: 'auto',
                                    maxWidth: '100%',
                                    maxHeight: '100%',
                                    objectFit: 'contain',
                                }}
                            />
                        </Box>
                        <Box flex={1} display="flex" flexDirection="column" gap={2}>
                            <Button variant="outlined" component="label" >
                                이미지 업로드
                                <input hidden accept="image/*" type="file" onChange={handleImageChange} />
                            </Button>
                        </Box>
                    </Box>
                    <Box mt={4} display="flex" gap={2}>
                        <Button fullWidth variant="contained" >저장</Button>
                    </Box>
                </Box>

            </Modal>
        </>

    )
}
export default MainFeesUtil