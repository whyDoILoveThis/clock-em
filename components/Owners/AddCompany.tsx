"use state";
import { fbUploadImage } from "@/lib/firebaseStorage";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Props {
  ownerId: string | null | undefined;
  refetch: () => Promise<any>;
}

const AddCompany = ({ ownerId, refetch }: Props) => {
  const [formData, setFormData] = useState({
    name: "",
    logoUrl: "",
    phone: "",
    address: "",
    estDate: "",
  });
  const [inputImage, setInputImage] = useState("");
  const [logo, setLogo] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogo(file);
      // Use FileReader to read and display the image
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setInputImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let imageUrl = "";
      if (logo) {
        console.log("upload attempt");

        imageUrl = await fbUploadImage(logo);
        console.log("upload complete");
        refetch();
      } else {
      }

      const userPayload = {
        ...formData,
        logoUrl: imageUrl,
      };

      const response = await fetch("/api/addCompany", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ownerId, company: userPayload }),
      });

      const data = await response.json();
      setMessage(data.message || data.error);
      refetch();
    } catch (error) {
      console.error("❌ An error occurred:", error);
    }
    router.push("/");
  };

  return (
    <form className="flex flex-col gap-2  px-2" onSubmit={handleSubmit}>
      <label className="border flex flex-col p-2 rounded-2xl">
        Name:
        <input
          className="bg-transparent"
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </label>
      <label className="border flex items-center p-2 rounded-2xl">
        Logo:
        <input
          className="max-w-[110px] bg-transparent"
          type="file"
          id="logo"
          onChange={onFileChange}
          placeholder="Logo"
        />
        {inputImage && (
          <Image width={30} height={30} src={inputImage} alt={"input image"} />
        )}
      </label>
      <label className="border flex flex-col p-2 rounded-2xl">
        Phone:
        <input
          className="bg-transparent"
          type="text"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          required
        />
      </label>
      <label className="border flex flex-col p-2 rounded-2xl">
        Address:
        <input
          className="bg-transparent"
          type="text"
          name="address"
          value={formData.address}
          onChange={handleChange}
          required
        />
      </label>
      <label className="border flex flex-col p-2 rounded-2xl">
        Established Date:
        <input
          className="bg-transparent"
          type="date"
          name="estDate"
          value={formData.estDate}
          onChange={handleChange}
          required
        />
      </label>
      <button className="btn self-end" type="submit">
        Add Company
      </button>
      {message && <p>{message}</p>}
    </form>
  );
};

export default AddCompany;
