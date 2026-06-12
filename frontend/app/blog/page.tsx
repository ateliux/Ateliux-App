import type { Metadata } from "next";
import { BlogPage } from "../../components/blog/BlogPage";

export const metadata: Metadata = {
  title: "Blog — Ateliux",
  description:
    "Conteúdos sobre software, design, e-commerce, SaaS, dashboards, automações e ecossistemas digitais.",
};

export default function BlogRoute() {
  return <BlogPage />;
}