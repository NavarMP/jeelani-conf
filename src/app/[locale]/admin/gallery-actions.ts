"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// --- Categories ---

export async function getGalleryCategories() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("gallery_categories")
    .select("*")
    .order("order_index", { ascending: true });

  if (error) {
    console.error("Error fetching gallery categories:", error);
    return [];
  }
  return data;
}

export async function createGalleryCategory(formData: FormData) {
  const name = formData.get("name") as string;
  if (!name) return { error: "Name is required" };

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

  const supabase = await createClient();
  
  // Get max order index
  const { data: maxOrderData } = await supabase
    .from("gallery_categories")
    .select("order_index")
    .order("order_index", { ascending: false })
    .limit(1);
    
  const nextOrderIndex = maxOrderData && maxOrderData.length > 0 ? maxOrderData[0].order_index + 1 : 1;

  const { data, error } = await supabase
    .from("gallery_categories")
    .insert([{ name, slug, order_index: nextOrderIndex }])
    .select()
    .single();

  if (error) {
    console.error("Error creating category:", error);
    return { error: error.message };
  }

  revalidatePath("/[locale]/admin", "layout");
  return { data };
}

export async function updateGalleryCategory(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  if (!name) return { error: "Name is required" };

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("gallery_categories")
    .update({ name, slug })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating category:", error);
    return { error: error.message };
  }

  revalidatePath("/[locale]/admin", "layout");
  return { data };
}

export async function deleteGalleryCategory(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("gallery_categories")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting category:", error);
    return { error: error.message };
  }

  revalidatePath("/[locale]/admin", "layout");
  return { success: true };
}

// --- Media ---

export async function getGalleryMedia() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("gallery_media")
    .select("*, category:gallery_categories(*)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching gallery media:", error);
    return [];
  }
  return data;
}

export async function uploadGalleryMedia(formData: FormData) {
  const file = formData.get("file") as File;
  const title = formData.get("title") as string;
  const categoryId = formData.get("category_id") as string;
  const aspect = (formData.get("aspect") as string) || "16/9";
  const isPublished = formData.get("is_published") === "true";

  if (!file && !(formData.get("url"))) {
    return { error: "File or URL is required" };
  }
  if (!title) return { error: "Title is required" };
  if (!categoryId) return { error: "Category is required" };

  const supabase = await createClient();
  let url = formData.get("url") as string;

  if (file && file.size > 0) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('gallery-media')
      .upload(fileName, file);

    if (uploadError) {
      console.error("Error uploading file:", uploadError);
      return { error: "Failed to upload file." };
    }

    const { data: publicUrlData } = supabase.storage
      .from('gallery-media')
      .getPublicUrl(fileName);
      
    url = publicUrlData.publicUrl;
  }

  // Create media record
  const { data, error } = await supabase
    .from("gallery_media")
    .insert([{
      title,
      category_id: categoryId,
      url,
      aspect,
      is_published: isPublished,
      color: "from-[#103E79] to-[#218EB6]"
    }])
    .select()
    .single();

  if (error) {
    console.error("Error creating media:", error);
    return { error: error.message };
  }

  revalidatePath("/[locale]/admin", "layout");
  return { data };
}

export async function togglePublishGalleryMedia(id: string, currentStatus: boolean) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("gallery_media")
    .update({ is_published: !currentStatus })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error toggling publish:", error);
    return { error: error.message };
  }

  revalidatePath("/[locale]/admin", "layout");
  return { data };
}

export async function deleteGalleryMedia(id: string) {
  const supabase = await createClient();
  
  // Get media to find URL to delete from storage if it exists
  const { data: mediaData } = await supabase
    .from("gallery_media")
    .select("url")
    .eq("id", id)
    .single();
    
  if (mediaData && mediaData.url && mediaData.url.includes("gallery-media")) {
    const fileName = mediaData.url.split('/').pop();
    if (fileName) {
      await supabase.storage.from("gallery-media").remove([fileName]);
    }
  }

  const { error } = await supabase
    .from("gallery_media")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting media:", error);
    return { error: error.message };
  }

  revalidatePath("/[locale]/admin", "layout");
  return { success: true };
}

export async function bulkDeleteGalleryMedia(ids: string[]) {
  const supabase = await createClient();
  
  // Find files to delete
  const { data: mediaItems } = await supabase
    .from("gallery_media")
    .select("url")
    .in("id", ids);
    
  const filesToDelete = mediaItems
    ?.filter(m => m.url && m.url.includes("gallery-media"))
    .map(m => m.url.split('/').pop()!)
    .filter(Boolean) || [];
    
  if (filesToDelete.length > 0) {
    await supabase.storage.from("gallery-media").remove(filesToDelete);
  }
  
  const { error } = await supabase
    .from("gallery_media")
    .delete()
    .in("id", ids);

  if (error) {
    console.error("Error bulk deleting media:", error);
    return { error: error.message };
  }

  revalidatePath("/[locale]/admin", "layout");
  return { success: true };
}

export async function bulkTogglePublishGalleryMedia(ids: string[], isPublished: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("gallery_media")
    .update({ is_published: isPublished })
    .in("id", ids);

  if (error) {
    console.error("Error bulk updating media:", error);
    return { error: error.message };
  }

  revalidatePath("/[locale]/admin", "layout");
  return { success: true };
}

export async function updateGalleryMedia(id: string, formData: FormData) {
  const title = formData.get("title") as string;
  const categoryId = formData.get("category_id") as string;
  const aspect = (formData.get("aspect") as string) || "16/9";
  const url = formData.get("url") as string;
  const isPublished = formData.get("is_published") === "true";

  if (!title) return { error: "Title is required" };
  if (!categoryId) return { error: "Category is required" };

  const supabase = await createClient();
  const updateData: any = {
    title,
    category_id: categoryId,
    aspect,
    is_published: isPublished,
  };

  if (url) {
    updateData.url = url;
  }

  const { data, error } = await supabase
    .from("gallery_media")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating media:", error);
    return { error: error.message };
  }

  revalidatePath("/[locale]/admin", "layout");
  return { data };
}
