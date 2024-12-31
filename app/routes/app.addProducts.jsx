// routes/app/products/add.tsx

import { json } from "@remix-run/node";
import { useFetcher, useNavigate } from "@remix-run/react";
import { useEffect, useState } from "react";
import { Frame, TextField, Button, Layout, Card } from "@shopify/polaris";

export const loader = async ({ request }) => {
  return json({});
};

// AddProductForm Component
export default function AddProductForm() {
  const fetcher = useFetcher();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [vendor, setVendor] = useState("");

  const navigate = useNavigate();
  const handleSubmit = (e) => {
    e.preventDefault();

    fetcher.submit(
      {
        title,
        description,
        price,
        vendor,
      },
      { method: "POST", action: "/app/products/add" },
    );
  };

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data) {
      if (fetcher.data.success) {
        fetcher.load("/app");
        navigate("/app");
      } else if (fetcher.data.error) {
        console.error(fetcher.data.error);
      }
    }
  }, [fetcher.state, fetcher.data]);

  return (
    <Frame fullWidth>
      <Layout>
        <Layout.Section>
          <Card>
            <fetcher.Form method="post" onSubmit={handleSubmit}>
              <TextField
                label="Title"
                value={title}
                onChange={(e) => setTitle(e)}
                required
              />
              <TextField
                label="Description"
                value={description}
                onChange={(e) => setDescription(e)}
                multiline
                required
              />
              <TextField
                label="Price"
                value={price}
                onChange={(e) => setPrice(e)}
                type="number"
                required
              />
              <TextField
                label="Vendor"
                value={vendor}
                onChange={(e) => setVendor(e)}
                required
              />
              <Button submit primary>
                Add Product
              </Button>

              <Button onClick={() => navigate("/app")}>
                Cancel
              </Button>
            </fetcher.Form>
          </Card>
        </Layout.Section>
      </Layout>
    </Frame>
  );
}
