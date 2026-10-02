import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Save, Eye, Copy, Plus } from "lucide-react";
import api from "../api/client";
import SEO from "../components/SEO";
import PageLoader from "../components/PageLoader";
import RichTextEditor from "./RichTextEditor";
import { Field, Toggle, Toast, UploadInput, ListEditor } from "./AdminUI";
import { slugify } from "../utils/helpers";

export default function BlogEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    if (id) {
      api.get(`/admin/blogs/${id}`).then(({ data }) => setBlog(data));
    } else {
      setBlog({
        title: "", slug: "", excerpt: "", content: "", author: "Dr. Sushma Appaiah",
        cover: "", images: [], category: "Nutrition", tags: [],
        published: false, featured: false, scheduledAt: "", seoTitle: "", metaDescription: "",
      });
    }
    api.get("/admin/blogs").then(({ data }) => setCategories([...new Set(data.items.map((b) => b.category).filter(Boolean))]));
  }, [id]);

  if (!blog) return <PageLoader label="Loading editor…" />;

  const set = (key) => (e) => setBlog({ ...blog, [key]: e.target.value });
  const setVal = (key, value) => setBlog({ ...blog, [key]: value });

  const save = async (publish) => {
    setSaving(true);
    try {
      const payload = {
        ...blog,
        published: publish,
        scheduledAt: blog.scheduledAt ? new Date(blog.scheduledAt).toISOString() : null,
      };
      if (id) {
        await api.put(`/admin/blogs/${id}`, payload);
        setToast({ message: publish ? "Published!" : "Changes saved" });
      } else {
        const { data } = await api.post("/admin/blogs", payload);
        navigate(`/admin/blogs/${data._id}`, { replace: true });
        setToast({ message: publish ? "Published!" : "Draft saved" });
      }
    } catch (e) {
      setToast({ message: e.response?.data?.message || "Save failed", type: "error" });
    } finally {
      setSaving(false);
      setTimeout(() => setToast(null), 3000);
    }
  };

  return (
    <>
      <SEO title={id ? "Edit Blog" : "New Blog"} />
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/admin/blogs" className="rounded-xl border border-gray-200 p-2.5 text-charcoal/60 transition hover:border-primary hover:text-primary" aria-label="Back to blogs">
            <ArrowLeft size={17} />
          </Link>
          <div>
            <h2 className="font-heading text-lg font-bold text-charcoal">{id ? "Edit Post" : "New Post"}</h2>
            <p className="text-xs text-charcoal/50">Slug: /blogs/{blog.slug || "auto-generated"}</p>
          </div>
        </div>
        <div className="flex gap-2.5">
          <button onClick={() => setPreview(!preview)} className="btn-outline !px-5 !py-2.5 !text-sm">
            <Eye size={16} /> {preview ? "Edit" : "Preview"}
          </button>
          <button onClick={() => save(false)} disabled={saving} className="btn-outline !px-5 !py-2.5 !text-sm disabled:opacity-60">
            <Copy size={16} /> Save Draft
          </button>
          <button onClick={() => save(true)} disabled={saving} className="btn-primary !px-5 !py-2.5 !text-sm disabled:opacity-60">
            <Save size={16} /> {saving ? "Saving…" : blog.published ? "Publish" : "Publish Now"}
          </button>
        </div>
      </div>

      {preview ? (
        <div className="card mx-auto max-w-3xl p-10">
          <h1 className="mb-4 font-heading text-3xl font-bold text-charcoal">{blog.title}</h1>
          <p className="mb-6 text-sm text-charcoal/50">{blog.author} • {blog.category} • ~{Math.max(1, Math.round((blog.content || "").replace(/<[^>]*>/g, " ").split(/\s+/).filter(Boolean).length / 200))} min read</p>
          {blog.cover && <img src={blog.cover} alt="" className="mb-8 aspect-video w-full rounded-2xl object-cover" />}
          <div className="rich-text" dangerouslySetInnerHTML={{ __html: blog.content }} />
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
          <div className="space-y-6">
            <div className="card space-y-5 p-6">
              <Field label="Title *">
                <input className="input" value={blog.title} onChange={(e) => {
                  const title = e.target.value;
                  if (!blog.slug || blog.slug === slugify(title.slice(0, -1))) {
                    setBlog({ ...blog, title, slug: slugify(title) });
                  } else {
                    setBlog({ ...blog, title });
                  }
                }} required />
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Slug" hint="URL-friendly identifier">
                  <input className="input" value={blog.slug} onChange={set("slug")} />
                </Field>
                <Field label="Author">
                  <input className="input" value={blog.author} onChange={set("author")} />
                </Field>
              </div>
              <Field label="Excerpt" hint="Short summary shown on cards">
                <textarea rows={3} className="input resize-none" value={blog.excerpt} onChange={set("excerpt")} />
              </Field>
              <Field label="Content (rich text) *">
                <RichTextEditor value={blog.content} onChange={(content) => setVal("content", content)} />
              </Field>
            </div>

            <div className="card p-6">
              <h3 className="mb-4 font-heading font-semibold text-charcoal">Media</h3>
              <Field label="Featured / cover image">
                <UploadInput value={blog.cover} onChange={(url) => setVal("cover", url)} />
              </Field>
              <div className="mt-5">
                <Field label="Additional images (used in article)">
                  <div className="flex flex-wrap gap-3">
                    {(blog.images || []).map((img, i) => (
                      <div key={img + i} className="relative h-20 w-28">
                        <img src={img} alt="" className="h-full w-full rounded-xl object-cover" />
                        <button onClick={() => setVal("images", blog.images.filter((_, j) => j !== i))}
                          className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white" aria-label="Remove image">×</button>
                      </div>
                    ))}
                    <label className="flex h-20 w-28 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-gray-300 text-charcoal/40 transition hover:border-primary hover:text-primary">
                      <Plus size={20} />
                      <input type="file" accept="image/*" className="hidden"
                        onChange={async (e) => {
                          const f = e.target.files?.[0];
                          if (!f) return;
                          const form = new FormData();
                          form.append("file", f);
                          const { data } = await api.post("/admin/upload", form);
                          setVal("images", [...(blog.images || []), data.url]);
                        }} />
                    </label>
                  </div>
                </Field>
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="card space-y-5 p-6">
              <h3 className="font-heading font-semibold text-charcoal">Publication</h3>
              <Field label="Category">
                <input className="input" list="blog-categories" value={blog.category} onChange={set("category")} />
                <datalist id="blog-categories">{categories.map((c) => <option key={c} value={c} />)}</datalist>
              </Field>
              <Field label="Tags">
                <ListEditor items={blog.tags} onChange={(tags) => setVal("tags", tags)} placeholder="Add tag" />
              </Field>
              <Field label="Schedule publish (optional)" hint="Leave empty to publish immediately when you hit Publish">
                <input type="datetime-local" className="input" value={blog.scheduledAt ? new Date(blog.scheduledAt).toISOString().slice(0, 16) : ""} onChange={set("scheduledAt")} />
              </Field>
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-3 text-sm font-medium text-charcoal/75">
                  <Toggle checked={!!blog.published} onChange={(v) => setVal("published", v)} label="Published" /> Published
                </label>
                <label className="flex items-center gap-3 text-sm font-medium text-charcoal/75">
                  <Toggle checked={!!blog.featured} onChange={(v) => setVal("featured", v)} label="Featured" /> Featured
                </label>
              </div>
            </div>

            <div className="card space-y-5 p-6">
              <h3 className="font-heading font-semibold text-charcoal">SEO</h3>
              <Field label="SEO title" hint="Overrides the browser tab title">
                <input className="input" value={blog.seoTitle} onChange={set("seoTitle")} />
              </Field>
              <Field label="Meta description" hint={`${(blog.metaDescription || "").length}/160 characters`}>
                <textarea rows={3} className="input resize-none" value={blog.metaDescription} onChange={set("metaDescription")} />
              </Field>
            </div>
          </aside>
        </div>
      )}
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
    </>
  );
}
