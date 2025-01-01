import React, { useState } from "react";
import { FormLayout, Image, Modal, TextField } from "@shopify/polaris";
import { useFetcher } from "@remix-run/react";

export const ProductModal = ({
  active,
  handleModalChange,
  title,
  setTitle,
  description,
  setDescription,
  price,
  setPrice,
  vendor,
  setVendor,
  img,
  setImg,
  id,
  setId,
  variantId,
  setVariantId,
  setActive,
  isEditMode,
}) => {
  const fetcher = useFetcher();

  const handleImageFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileName", file.name);
      formData.append("fileType", file.type);

      try {
        const response = await fetch(
          "http://localhost:5000/files/uploadFile",
          {
            method: "POST",
            body: formData,
          },
        );

        const data = await response.json();
        if (!response.ok) {
          throw new Error("Failed to get the URL");
        }

        if (data) {
          setImg(data.fileUrl);
        } else {
          throw new Error("Failed to upload image");
        }
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    }
  };

  const handleSave = async () => {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("variantId", variantId);
    formData.append("vendor", vendor);
    formData.append("img", img);

    if (isEditMode) {
      formData.append("id", id);
      await fetcher.submit(formData, {
        method: "PUT",
        action: "/app/products/edit",
      });
    } else {
      await fetcher.submit(formData, {
        method: "POST",
        action: "/app/products/add",
      });
    }

    setTimeout(() => {
      setActive(!active);
    }, 2000);
  };

  return (
    <Modal
      open={active}
      onClose={handleModalChange}
      title={isEditMode ? "Edit Product" : "Add Product"}
      primaryAction={{
        content: isEditMode ? "save" : "Add",
        onAction: handleSave,
      }}
      secondaryActions={[
        {
          content: "Cancel",
          onAction: handleModalChange,
        },
      ]}
    >
      <Modal.Section>
        <FormLayout>
          <TextField
            label="Title"
            onChange={(title) => setTitle(title)}
            value={title}
          />
          <TextField
            label="Description"
            value={description}
            onChange={(description) => setDescription(description)}
          />
          <TextField
            label="Price"
            value={price}
            onChange={(price) => setPrice(price)}
            type="number"
          />
          <TextField
            label="Vendor"
            onChange={(vendor) => setVendor(vendor)}
            value={vendor}
            type="text"
          />

          {img ? (
            <div style={styles.imagePreviewContainer}>
              <Image
                source={img}
                alt="Product Image"
                style={styles.imagePreview}
              />
              <div style={styles.uploadContainer}>
                <input
                  style={styles.inputFile}
                  label="Update Image"
                  type="file"
                  onChange={handleImageFileChange}
                />
              </div>
            </div>
          ) : (
            <div style={styles.uploadContainer}>
              <input
                style={styles.inputFile}
                label="Upload Image"
                type="file"
                onChange={handleImageFileChange}
              />
            </div>
          )}
        </FormLayout>
      </Modal.Section>
    </Modal>
  );
};

const styles = {
  uploadContainer: {
    marginTop: 20,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  inputFile: {
    backgroundColor: "#fafafa",
    border: "2px dashed #007cba",
    padding: "15px 20px",
    fontSize: "16px",
    width: "80%",
    textAlign: "center",
    cursor: "pointer",
    borderRadius: "8px",
    outline: "none",
    transition: "all 0.3s ease",
  },
  inputFileHover: {
    borderColor: "#005f8a",
    backgroundColor: "#e5f7fd",
  },
  imagePreviewContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 15,
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: "8px",
    objectFit: "cover",
  },
};
