import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ToolCard } from "@/components/tool-card";
import { Combine, Split, Minimize2, Image as ImageIcon, FileJson, RotateCw, Shield, Unlock, FileType, Stamp, Hash, LayoutGrid } from "lucide-react";

export default function Home() {
  const tools = [
    {
      title: "Merge PDF",
      description: "Combine PDFs in the order you want with the easiest PDF merger available.",
      icon: Combine,
      href: "/merge-pdf",
    },
    {
      title: "Split PDF",
      description: "Separate one page or a whole set for easy conversion into independent PDF files.",
      icon: Split,
      href: "/split-pdf",
    },
    {
      title: "Compress PDF",
      description: "Reduce file size while optimizing for maximal PDF quality.",
      icon: Minimize2,
      href: "/compress-pdf",
    },
    {
      title: "PDF to Image",
      description: "Convert each PDF page into a JPG or extract all images contained in a PDF.",
      icon: ImageIcon,
      href: "/pdf-to-image",
    },
    {
      title: "Image to PDF",
      description: "Convert JPG images to PDF in seconds. Easily adjust orientation and margins.",
      icon: FileJson, // Using FileJson as placeholder for Image->PDF generic icon or FileType
      href: "/image-to-pdf",
    },
    {
      title: "Rotate PDF",
      description: "Rotate your PDFs the way you need them. You can even rotate multiple PDFs at once!",
      icon: RotateCw,
      href: "/rotate-pdf",
    },
    {
      title: "Watermark PDF",
      description: "Stamp text over your PDF pages. Customize position, transparency, and typography.",
      icon: Stamp,
      href: "/watermark-pdf",
    },
    {
      title: "Page Numbers",
      description: "Easily number your PDF pages. Choose position, start number, and style.",
      icon: Hash,
      href: "/page-numbers",
    },
    {
      title: "Organize PDF",
      description: "Rearrange document pages, delete unnecessary ones, and download your new PDF.",
      icon: LayoutGrid,
      href: "/organize-pdf",
    },
    {
      title: "Protect PDF",
      description: "Encrypt your PDF with a password to keep sensitive data confidential.",
      icon: Shield,
      href: "/protect-pdf",
    },
    {
      title: "Unlock PDF",
      description: "Remove PDF password security, giving you the freedom to use your PDFs as you want.",
      icon: Unlock,
      href: "/unlock-pdf",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-[#e11d48] pt-20 pb-32 px-4 text-center">
        <div className="container mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
            SwiftPDF - The Feature Rich PDF Tool
          </h1>
          <p className="text-white/90 text-xl max-w-2xl mx-auto font-light leading-relaxed">
            All tools are 100% FREE! Merge, split, compress, convert, rotate, and secure your PDFs instantly.
          </p>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="container mx-auto px-4 -mt-20 mb-20 z-10 relative">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {tools.map((tool) => (
            <ToolCard key={tool.title} {...tool} />
          ))}
        </div>
      </section>

      {/* Value Proposition / SEO Text */}
      <section className="bg-white py-20 border-t border-border">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-8 text-foreground">The PDF Software Trusted by Millions of Users</h2>
          <div className="grid md:grid-cols-3 gap-8 text-left">
            <div>
              <h3 className="font-bold text-lg mb-2">Cost Effective</h3>
              <p className="text-muted-foreground text-sm">Our infrastructure is designed for efficiency, passing the savings to you.</p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2">Secure & Private</h3>
              <p className="text-muted-foreground text-sm">All processing happens in your browser where possible, ensuring maximum privacy.</p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2">Universal Compatibility</h3>
              <p className="text-muted-foreground text-sm">Works on all devices and platforms including Windows, Mac, and Linux.</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
