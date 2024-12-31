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
import { authenticate } from "../shopify.server";
import { json } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { ProductModal } from "./modal";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const response = await admin.graphql(`
    {
      products(first: 10) {
        edges {
          node {
            id
            title
            handle
            status
            description
            vendor
            variants(first: 10) {
              edges {
                node {
                  id
                  price
                  barcode
                  createdAt
                }
              }
            }
          }
        }
      }
    }
  `);

  const responseJson = await response.json();
  console.log(responseJson.data.products.edges);
  return json(responseJson);
};

const ProductTable = () => {
  const data = useLoaderData();
  const fetcher = useFetcher();
  const products = data.data.products.edges;
  console.log('----->', products)

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState();
  const [vendor, setVendor] = useState("");
  // const [img, setImg] = useState('');
  const [id, setId] = useState();
  const [variantId, setVariantId] = useState();

  // console.log('----->', products)

  const [active, setActive] = useState(false);

  const [toastActive, setToastActive] = useState(false);
  const [toastContent, setToastContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
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
      setDescription(product.description);
      setPrice(product.variants.edges[0]?.node.price);
      setVendor(product.vendor);
      setId(product.id);
      setVariantId(product.variants.edges[0]?.node.id);
    } else {
      setIsEditMode(false);
      setTitle("");
      setDescription("");
      setPrice("");
      setVendor("");
      setId(null);
      setVariantId(null);
      // setImg('')
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
    // Check if the fetcher state is idle and the data is not being loaded again.
    if (fetcher.state === "idle" && fetcher.data) {
      if (fetcher.data.success) {
        setToastContent(
          deletingProductId
            ? "Product Successfully Deleted"
            : "Product Updated Successfully",
        );
        setToastActive(true);
        setActive(false);
        setIsSaving(false);
        setDeletingProductId(null);

        fetcher.load("/app");
      } else if (fetcher.data.error) {
        console.error(fetcher.data.error);
        setIsSaving(false);
      }
    }
  }, [fetcher.state, fetcher.data]);

  const rows = products.map((product) => [
    // <Thumbnail
    //   key={product.node.id}
    //   source={product.node.images.edges[0]?.node.originalSrc || ""}
    //   alt={product.node.images.edges[0]?.node.altText || "Image not available"}
    // />,
    product.node.title,
    product.node.description,
    product.node.vendor,
    product.node.variants.edges[0]?.node.price || "",
    <Button onClick={() => handleEdit(product.node)}>Edit</Button>,
    <Button
      onClick={() => handleDelete(product.node.id)}
      loading={deletingProductId === product.node.id}
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
                "number",
                "text",
                "text",
              ]}
              headings={[
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
        setIsSaving={setIsSaving}
        title={title}
        setTitle={setTitle}
        description={description}
        setDescription={setDescription}
        price={price}
        setPrice={setPrice}
        vendor={vendor}
        setVendor={setVendor}
        // img={img}
        // setImg={setImg}
        id={id}
        setId={setId}
        variantId={variantId}
        setVariantId={setVariantId}
        setActive={setActive}
        isEditMode = {isEditMode}
        setIsEditMode = {setIsEditMode}
      />

      {toastActive && (
        <Toast content={toastContent} onDismiss={toggleToastActive} />
      )}
    </Frame>
  );
};

export default ProductTable;
