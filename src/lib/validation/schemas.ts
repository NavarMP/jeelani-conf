import { z } from "zod";

const phoneRegex = /^[0-9]{10}$/;

export const grandAssemblySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().regex(phoneRegex, "Must be a valid 10-digit phone number"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  dars: z.string().min(2, "Please select or enter your Dars"),
  place: z.string().min(2, "Place is required"),
});

export const darimiSessionSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().regex(phoneRegex, "Must be a valid 10-digit phone number"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  place: z.string().min(2, "Place is required"),
});

export const paperPresentationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().regex(phoneRegex, "Must be a valid 10-digit phone number"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  place: z.string().min(2, "Place is required"),
  paperTitle: z.string().min(5, "Paper title is required"),
  abstract: z.string().min(50, "Abstract must be at least 50 characters long"),
  file: z.any().optional(), // In a real app, validate File object
});

export type GrandAssemblyFormData = z.infer<typeof grandAssemblySchema>;
export type DarimiSessionFormData = z.infer<typeof darimiSessionSchema>;
export type PaperPresentationFormData = z.infer<typeof paperPresentationSchema>;

// Feedback form validation
export const feedbackSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional().or(z.literal("")),
  phone: z.string().regex(/^[0-9]{10}$/, "Must be a valid 10-digit phone number").optional().or(z.literal("")),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  overall_rating: z.number().int().min(1, "Please select a rating").max(5),
  category_ratings: z.record(z.string(), z.number().int().min(1).max(5)).optional(),
  feedback_text: z.string().min(10, "Feedback must be at least 10 characters").max(2000, "Feedback must be under 2000 characters"),
  category: z.enum(["general", "sessions", "speakers", "venue", "food", "registration", "suggestion"]).default("general"),
});

export type FeedbackFormData = z.infer<typeof feedbackSchema>;
