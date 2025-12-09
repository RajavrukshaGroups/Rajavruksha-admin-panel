import * as React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Grid, TextField, Button, Typography } from "@mui/material";
import "./careers.css";
import Loader from "../../MainComp/Loader/loader";

const CareersComponent = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [shortTitle, setShortTitle] = useState("");
  const [description, setDescription] = useState("");
  const [qualifications, setQualifications] = useState("");
  const [skills, setSkills] = useState([]);
  const [experience, setExperience] = useState("");
  const [salary, setSalary] = useState("");
  const [age, setAge] = useState("");
  const [timings, setTimings] = useState("");
  const [category, setCategory] = useState("");
  const [jobType, setJobType] = useState("");
  const [location, setLocation] = useState("");
  const [link, setLink] = useState("");
  const [image, setImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const imageInputRef = React.useRef(null);

  const handleSkillsChange = (index, event) => {
    const values = [...skills];
    values[index] = event.target.value;
    setSkills(values);

    setErrors((prevErrors) => ({
      ...prevErrors,
      skills: undefined,
    }));
  };

  const addNewSkillField = () => {
    setSkills([...skills, ""]);
  };

  const deleteSkillField = (index) => {
    const updatedSkills = skills.filter((_, i) => i !== index);
    setSkills(updatedSkills);
  };

  const handleInputChange = (e, field) => {
    const { value } = e.target;

    setErrors((prevErrors) => ({
      ...prevErrors,
      [field]: undefined,
    }));

    switch (field) {
      case "title":
        setTitle(value);
        break;
      case "shortTitle":
        setShortTitle(value);
        break;
      case "description":
        setDescription(value);
        break;
      case "qualifications":
        setQualifications(value);
        break;
      case "experience":
        setExperience(value);
        break;
      case "salary":
        setSalary(value);
        break;
      case "age":
        setAge(value);
        break;
      case "timings":
        setTimings(value);
        break;
      case "category":
        setCategory(value);
        break;
      case "jobType":
        setJobType(value);
        break;
      case "location":
        setLocation(value);
        break;
      case "link":
        setLink(value);
        break;
      default:
        break;
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setImage(URL.createObjectURL(file)); // Use URL.createObjectURL for preview
      setErrors((prevErrors) => ({
        ...prevErrors,
        image: undefined,
      }));
    } else {
      setErrors((prevErrors) => ({
        ...prevErrors,
        image: "Please select a valid image file",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!title) newErrors.title = "Career Title is required";
    if (!shortTitle) newErrors.shortTitle = "Career Short Title is required";

    if (!description)
      newErrors.description = "Job Role Description is required";
    if (!qualifications)
      newErrors.qualifications = "Qualifications are required";

    if (skills.length === 0 || skills.some((skill) => !skill.trim())) {
      newErrors.skills = "Please add at least one skill before submitting";
    }

    if (!experience) newErrors.experience = "Experience is required";
    if (!category) newErrors.category = "Job Category is required";
    if (!jobType) newErrors.jobType = "Job Type is required";
    if (!location) newErrors.location = "Location is required";
    if (!salary) newErrors.salary = "Salary is required";
    if (!age) newErrors.age = "Age is required";
    if (!timings) newErrors.timings = "Timings is required";
    if (!link) newErrors.link = "link is required";
    if (!image) newErrors.image = "Image is required"; // Image validation
    if (image) URL.revokeObjectURL(image);
    if (Object.keys(newErrors).length === 0) {
      setLoading(true);
      const formData = new FormData();
      console.log("Appending data to formData:");

      // Append form fields to formData
      formData.append("title", title);
      formData.append("shortTitle", shortTitle);
      formData.append("description", description);
      formData.append("qualifications", qualifications);
      formData.append("skills", JSON.stringify(skills)); // Pass as JSON string
      formData.append("experience", experience);
      formData.append("salary", salary || "");
      formData.append("age", age || "");
      formData.append("timings", timings || "");
      formData.append("category", category);
      formData.append("jobType", jobType);
      formData.append("location", location);
      formData.append("link", link);

      // Check if image input exists and append it to the formData
      if (imageInputRef.current?.files[0]) {
        const file = imageInputRef.current.files[0];
        formData.append("image", file); // Attach the actual file
        console.log("Appending image to formData:", file);
      }

      // Log the formData contents (you won't be able to log the FormData directly as it’s not serializable, but you can log individual keys)
      for (let pair of formData.entries()) {
        console.log(pair[0] + ": " + pair[1]);
      }

      try {
        const response = await fetch(
          "https://rrplserver.rajavrukshagroup.in/newCareer",
          // "http://localhost:5000/newCareer",
          {
            method: "POST",
            body: formData,
          }
        );

        if (response.ok) {
          alert("Form submitted successfully!");
          navigate("/careers");

          // Reset form fields
          setTitle("");
          setShortTitle("");
          setDescription("");
          setQualifications("");
          setSkills([]);
          setExperience("");
          setSalary("");
          setAge("");
          setTimings("");
          setCategory("");
          setJobType("");
          setLocation("");
          setLink("");
          setImage(null);
          setErrors({});

          // Clear the file input and image preview
          imageInputRef.current.value = ""; // Reset the file input value
        } else {
          alert("Error submitting form. Please try again.");
        }
      } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while submitting the form.");
      } finally {
        setLoading(false);
      }
    } else {
      setErrors(newErrors);
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
        Create New Career
      </Typography>

      <Box
        component="form"
        sx={{ display: "flex", flexDirection: "column", width: "100%", gap: 2 }}
        noValidate
        autoComplete="off"
        onSubmit={handleSubmit}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Career Title"
              variant="outlined"
              name="title"
              required
              value={title}
              onChange={(e) => handleInputChange(e, "title")}
              error={!!errors.title}
              helperText={errors.title}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Short Title"
              variant="outlined"
              name="shortTitle"
              required
              value={shortTitle}
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
              name="description"
              required
              multiline
              rows={4}
              value={description}
              onChange={(e) => handleInputChange(e, "description")}
              error={!!errors.description}
              helperText={errors.description}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Qualifications"
              name="qualifications"
              variant="outlined"
              required
              value={qualifications}
              onChange={(e) => handleInputChange(e, "qualifications")}
              error={!!errors.qualifications}
              helperText={errors.qualifications}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6">Skills or Requirements</Typography>
            {skills.map((skill, index) => (
              <Box
                key={index}
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <TextField
                  fullWidth
                  label={`Skill ${index + 1}`}
                  variant="outlined"
                  value={skill}
                  onChange={(e) => handleSkillsChange(index, e)}
                  sx={{ marginTop: "10px" }}
                  error={!!errors.skills}
                  helperText={
                    errors.skills && index === skills.length - 1
                      ? "Please add at least one skill"
                      : ""
                  }
                />
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => deleteSkillField(index)}
                  sx={{ minWidth: "auto" }}
                >
                  Delete
                </Button>
              </Box>
            ))}
            <Button
              className="skill-btn"
              variant="outlined"
              onClick={addNewSkillField}
              sx={{ marginTop: 1 }}
              disabled={skills.length > 0 && skills[skills.length - 1] === ""}
            >
              Add New Skill
            </Button>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Experience"
              variant="outlined"
              name="experience"
              required
              value={experience}
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
              name="salary"
              required
              value={salary}
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
              name="age"
              required
              value={age}
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
              name="timings"
              required
              value={timings}
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
              name="category"
              required
              value={category}
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
              name="jobType"
              required
              value={jobType}
              onChange={(e) => handleInputChange(e, "jobType")}
              error={!!errors.jobType}
              helperText={errors.jobType}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Add link"
              variant="outlined"
              name="link"
              required
              value={link}
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
              name="location"
              required
              value={location}
              onChange={(e) => handleInputChange(e, "location")}
              error={!!errors.location}
              helperText={errors.location}
            />
          </Grid>

          {/* Image Upload Section */}
          <Grid item xs={12}>
            <Typography variant="h6">Upload Job Image</Typography>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ marginBottom: "10px" }}
            />
            {image && (
              <Box sx={{ marginTop: 2 }}>
                <img
                  src={image} // Use the temporary URL for the image preview
                  alt="Preview"
                  style={{
                    width: "100%",
                    maxHeight: "300px",
                    objectFit: "cover",
                  }}
                />
              </Box>
            )}

            {errors.image && (
              <Typography color="error" variant="body2">
                {errors.image}
              </Typography>
            )}
          </Grid>
        </Grid>

        <Box sx={{ display: "flex", justifyContent: "flex-end", marginTop: 2 }}>
          <Button variant="contained" color="primary" type="submit">
            Submit
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default CareersComponent;
