import React, { useState } from "react";
import { FormLayout, Image, Modal, TextField } from "@shopify/polaris";
import { useFetcher } from "@remix-run/react";

export const ProductModal = ({
  active,
  handleModalChange,
  setIsSaving,
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

        const response = await fetch("http://localhost:5000/uploadFiles", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error("Failed to get the URL");
        }

        if (data) {
          setImg(data.fileUrl); 
        } else {
          throw new Error('Failed to upload image');
        }
      } catch (error) {
        console.error("Error uploading image:", error);
      } 
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
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
        method: "POST",
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

          {/*
          {img ? (
            <div>
              <Image
                source={img} 
                alt="Product Image"
                style={{ width: 100, height: 100 }}
              />
              <input
                label="Update Image"
                type="file"
                // value={img}
                onChange={handleImageFileChange} 
              />
            </div>
          ) : (
            <input
              label="Upload Image"
              type="file"
              value={img}
              onChange={handleImageFileChange}
            />
          )}
            */}
        </FormLayout>
      </Modal.Section>
    </Modal>
  );
};
