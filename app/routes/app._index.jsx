import React, { useState, useEffect, useCallback } from "react";
import {
  Button,
  Card,
  DataTable,
  Frame,
  Layout,
  Thumbnail,
  Toast,
} from "@shopify/polaris";
import { json } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { ProductModal } from "./modal";

import axios from "axios";

export const loader = async ({ request }) => {

  let products = [];
    try {
      const response = await axios.get("http://localhost:5000/products/fetchAll");

      const responseData = response.data;

      if (responseData ) {
        products = responseData;
      }
    } catch (error) {
      console.error("Error during axios request execution:", error);
    }
  return json({ products });
};


const ProductTable = () => {
  const data = useLoaderData();
  const fetcher = useFetcher();
  const products = data.products;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState();
  const [vendor, setVendor] = useState("");
  const [img, setImg] = useState('');
  const [id, setId] = useState();
  const [variantId, setVariantId] = useState();

  const [active, setActive] = useState(false);

  const [toastActive, setToastActive] = useState(false);
  const [toastContent, setToastContent] = useState("");
  const [deletingProductId, setDeletingProductId] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const handleDelete = async (prodId) => {
    setDeletingProductId(prodId);
    await fetcher.submit(
      { id: prodId },
      { method: "DELETE", action: "/app/products/delete" },
    );
  };

  const handleEdit = (product = null) => {
    if (product) {
      setIsEditMode(true);
      setTitle(product.title);
      setDescription(product.body_html);
      setPrice(product.variants?.[0]?.price);
      setVendor(product.vendor);
      setId(product.id);
      setVariantId(product?.variants?.[0]?.id);
      setImg(product?.image?.src)
    } else {
      setIsEditMode(false);
      setTitle("");
      setDescription("");
      setPrice("");
      setVendor("");
      setId(null);
      setVariantId(null);
      setImg('')
    }
    setActive(true);
  };

  const handleModalChange = useCallback(() => {
    setActive(!active);
  }, [active]);

  const toggleToastActive = useCallback(() => {
    setToastActive((active) => !active);
  }, []);

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data) {
      if (fetcher.data.success) {
        setToastContent(
          deletingProductId
            ? "Product Successfully Deleted"
            : "Product Updated Successfully",
        );
        setToastActive(true);
        setActive(false);
        setDeletingProductId(null);

        fetcher.load("/app");
      } else if (fetcher.data.error) {
        console.error(fetcher.data.error);
      }
    }
  }, [fetcher.state, fetcher.data]);

  const rows = products?.map((product) => [
    <Thumbnail
      key={product?.id}
      source={product?.image?.src || ""}
      alt={product?.image?.alt || "Image not available"}
    />,
    product.title,
    product.body_html,
    product.vendor,
    product.variants[0]?.price || "",
    <Button onClick={() => handleEdit(product)}>Edit</Button>,
    <Button
      onClick={() => handleDelete(product.id)}
      loading={deletingProductId === product.id}
    >
      Delete
    </Button>,
  ]);

  return (
    <Frame fullWidth style={{ backgroundColor: "#f4f6f8" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h1 style={{ margin: 0 }}>Products list</h1>
        <Button onClick={() => handleEdit()}>Add Product</Button>
      </div>
      <Layout>
        <Layout.Section>
          <Card>
            <DataTable
              columnContentTypes={[
                "text",
                "text",
                "text",
                "text",
                "number",
                "text",
                "text",
              ]}
              headings={[
                "Images",
                "Product Title",
                "Description",
                "Vendor",
                "Price",
                "Edit",
                "Delete",
              ]}
              rows={rows}
            />
          </Card>
        </Layout.Section>
      </Layout>

      <ProductModal
        active={active}
        handleModalChange={handleModalChange}
        title={title}
        setTitle={setTitle}
        description={description}
        setDescription={setDescription}
        price={price}
        setPrice={setPrice}
        vendor={vendor}
        setVendor={setVendor}
        img={img}
        setImg={setImg}
        id={id}
        setId={setId}
        variantId={variantId}
        setVariantId={setVariantId}
        setActive={setActive}
        isEditMode={isEditMode}
        setIsEditMode={setIsEditMode}
      />

      {toastActive && (
        <Toast content={toastContent} onDismiss={toggleToastActive} />
      )}
    </Frame>
  );
};

export default ProductTable;
