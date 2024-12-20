import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Grid, TextField, Button, Typography } from "@mui/material";
import "./careers.css";
import Loader from "../../MainComp/Loader/loader";

const EditCareerComponent = () => {
  const { id } = useParams(); // To get the career ID from the URL
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    shortTitle: "",
    description: "",
    qualifications: "",
    skills: [],
    experience: "",
    salary: "",
    age: "",
    timings: "",
    category: "",
    jobType: "",
    location: "",
    link: "",
    image: null,
  });
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const imageInputRef = React.useRef(null);

  // Fetch career details on mount
  useEffect(() => {
    const fetchCareerDetails = async () => {
      try {
        const response = await fetch(
          `https://server.rajavrukshagroup.in/getIndCareer/${id}`
          // `http://localhost:3000/getIndCareer/${id}`

        );
        if (response.ok) {
          const result = await response.json();
          const data = result.data;
          console.log("data", data);
          setFormData({
            title: data.title,
            shortTitle: data.shortTitle,
            description: data.description,
            qualifications: data.qualifications,
            skills: data.skills || [],
            experience: data.experience,
            salary: data.salary,
            age: data.age,
            timings: data.timings,
            category: data.category,
            jobType: data.jobType,
            location: data.location,
            link: data.link,
            image: data.image?.url || null, // Image won't be set directly; keep it as null
          });
          setImagePreview(data.image?.url || null); // Preview existing image
        } else {
          console.error("Failed to fetch career details");
        }
      } catch (error) {
        console.error("Error fetching career details:", error);
      }
    };
    fetchCareerDetails();
  }, [id]);

  const handleInputChange = (e, field) => {
    const { value } = e.target;
    setErrors((prevErrors) => ({
      ...prevErrors,
      [field]: undefined,
    }));
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const handleSkillsChange = (index, event) => {
    const values = [...formData.skills];
    values[index] = event.target.value;
    setFormData((prevData) => ({ ...prevData, skills: values }));
  };

  const addNewSkillField = () => {
    setFormData((prevData) => ({
      ...prevData,
      skills: [...prevData.skills, ""],
    }));
  };

  const deleteSkillField = (index) => {
    const updatedSkills = formData.skills.filter((_, i) => i !== index);
    setFormData((prevData) => ({ ...prevData, skills: updatedSkills }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setImagePreview(URL.createObjectURL(file)); // Show image preview
      setErrors((prevErrors) => ({ ...prevErrors, image: undefined }));
      setFormData((prevData) => ({ ...prevData, image: file }));
    } else {
      setErrors((prevErrors) => ({
        ...prevErrors,
        image: "Invalid image file",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};

    // Validation logic for all fields
    if (!formData.title.trim()) newErrors.title = "Career Title is required";
    if (!formData.shortTitle.trim())
      newErrors.shortTitle = "Career Short Title is required";

    if (!formData.description.trim())
      newErrors.description = "Job Role Description is required";
    if (!formData.qualifications.trim())
      newErrors.qualifications = "Qualifications are required";
    if (formData.skills.length === 0 || formData.skills.some((s) => !s.trim()))
      newErrors.skills = "Please add at least one valid skill";
    if (!formData.experience.trim())
      newErrors.experience = "Experience is required";
    if (!formData.salary.trim()) newErrors.salary = "Salary is required";
    if (!formData.age.trim()) newErrors.age = "Age is required";
    if (!formData.timings.trim()) newErrors.timings = "Timings are required";
    if (!formData.category.trim())
      newErrors.category = "Job Category is required";
    if (!formData.jobType.trim()) newErrors.jobType = "Job Type is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";
    if (!formData.link.trim()) newErrors.link = "link is required";

    if (!formData.image) newErrors.image = "Job Image is required";

    // If there are validation errors, set them and prevent form submission
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    // Prepare data for submission
    const updatedFormData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === "skills") {
        updatedFormData.append(key, JSON.stringify(value));
      } else if (key === "image" && value) {
        updatedFormData.append(key, value);
      } else {
        updatedFormData.append(key, value);
      }
    });

    try {
      const response = await fetch(`https://server.rajavrukshagroup.in/edit-career/${id}`, {
        method: "PUT",
        body: updatedFormData,
      });

      if (response.ok) {
        alert("Career updated successfully!");
        navigate("/careers");
      } else {
        alert("Failed to update career");
      }
    } catch (error) {
      console.error("Error updating career:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: 4,
        maxWidth: 800,
        margin: "0 auto",
      }}
    >
      {loading && <Loader />}
      <Typography variant="h4" gutterBottom>
        Edit Career
      </Typography>

      <Box
        component="form"
        sx={{ display: "flex", flexDirection: "column", width: "100%", gap: 2 }}
        noValidate
        autoComplete="off"
        onSubmit={handleSubmit}
      >
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Career Title"
              variant="outlined"
              required
              value={formData.title}
              onChange={(e) => handleInputChange(e, "title")}
              error={!!errors.title}
              helperText={errors.title}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Career Short Title"
              variant="outlined"
              required
              value={formData.shortTitle}
              onChange={(e) => handleInputChange(e, "shortTitle")}
              error={!!errors.shortTitle}
              helperText={errors.shortTitle}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Job Role Description"
              variant="outlined"
              required
              multiline
              rows={4}
              value={formData.description}
              onChange={(e) => handleInputChange(e, "description")}
              error={!!errors.description}
              helperText={errors.description}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Qualifications"
              variant="outlined"
              required
              value={formData.qualifications}
              onChange={(e) => handleInputChange(e, "qualifications")}
              error={!!errors.qualifications}
              helperText={errors.qualifications}
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h6">Skills</Typography>
            {formData.skills.map((skill, index) => (
              <Box
                key={index}
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <TextField
                  fullWidth
                  label={`Skill ${index + 1}`}
                  value={skill}
                  onChange={(e) => handleSkillsChange(index, e)}
                  sx={{ marginTop: "10px" }}
                />
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => deleteSkillField(index)}
                >
                  Delete
                </Button>
              </Box>
            ))}
            <Button
              variant="outlined"
              onClick={addNewSkillField}
              className="skill-btn"
              sx={{ marginTop: 2 }}
            >
              Add Skill
            </Button>
            {errors.skills && (
              <Typography color="error">{errors.skills}</Typography>
            )}
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Experience"
              variant="outlined"
              required
              value={formData.experience}
              onChange={(e) => handleInputChange(e, "experience")}
              error={!!errors.experience}
              helperText={errors.experience}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Salary"
              variant="outlined"
              required
              value={formData.salary}
              onChange={(e) => handleInputChange(e, "salary")}
              error={!!errors.salary}
              helperText={errors.salary}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Age"
              variant="outlined"
              required
              value={formData.age}
              onChange={(e) => handleInputChange(e, "age")}
              error={!!errors.age}
              helperText={errors.age}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Timings"
              variant="outlined"
              required
              value={formData.timings}
              onChange={(e) => handleInputChange(e, "timings")}
              error={!!errors.timings}
              helperText={errors.timings}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Job Category"
              variant="outlined"
              required
              value={formData.category}
              onChange={(e) => handleInputChange(e, "category")}
              error={!!errors.category}
              helperText={errors.category}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Job Type"
              variant="outlined"
              required
              value={formData.jobType}
              onChange={(e) => handleInputChange(e, "jobType")}
              error={!!errors.jobType}
              helperText={errors.jobType}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Edit link"
              variant="outlined"
              required
              value={formData.link}
              onChange={(e) => handleInputChange(e, "link")}
              error={!!errors.link}
              helperText={errors.link}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Location"
              variant="outlined"
              required
              value={formData.location}
              onChange={(e) => handleInputChange(e, "location")}
              error={!!errors.location}
              helperText={errors.location}
            />
          </Grid>

          {/* Image upload */}
          <Grid item xs={12}>
            <Typography variant="h6">Upload Job Image</Typography>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
            {errors.image && (
              <Typography color="error">{errors.image}</Typography>
            )}
            {imagePreview && <img src={imagePreview} alt="Preview" />}
            {formData.image && !imagePreview && (
              <Typography variant="body2">
                Current Image: {formData.image}
              </Typography>
            )}{" "}
          </Grid>
        </Grid>
        <Box sx={{ textAlign: "right" }}>
          <Button type="submit" variant="contained" color="primary">
            Update Career
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default EditCareerComponent;
