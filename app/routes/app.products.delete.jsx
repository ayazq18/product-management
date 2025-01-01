import { json } from "@remix-run/node";
import axios from "axios";

export const action = async ({ request }) => {
  const formData = await request.formData();
  const id = formData.get("id");

  const deleteProductUrl = `http://localhost:5000/products/delete/${id}`;

  try {
    const deleteResponse = await axios.delete(deleteProductUrl);
    if (deleteResponse.data.success) {
      return json({ success: true });
    } else {
      console.error("Failed to delete product:", deleteResponse.data);
      return json({ error: deleteResponse.data.error || "Failed to delete product" }, { status: 400 });
    }
  } catch (error) {
    console.error("Unexpected error occurred:", error);
    return json({ error: ["Unexpected error occurred", error.message || ""] }, { status: 500 });
  }
};
