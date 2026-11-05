import Link from "next/link";

export default function NotFound() {
  return (
    <main className="px-container-padding-mobile md:px-container-padding-desktop pb-20 md:pb-12">
      <h1 className="text-display-lg-mobile md:text-display-lg text-on-surface">That page is not on this road</h1>
      <p className="text-body-md text-secondary mt-3 max-w-2xl leading-relaxed">
        The address you asked for does not exist on i15pass.com. The corridor is still here: the live verdicts are
        on the homepage, and every camera is in the index.
      </p>
      <div className="flex flex-wrap gap-2 mt-6">
        <Link href="/" className="btn-nav-dark px-4 py-2 rounded-full text-sm font-semibold">Live verdicts</Link>
        <Link href="/cameras" className="btn-nav-dark px-4 py-2 rounded-full text-sm font-semibold">Camera index</Link>
        <Link href="/las-vegas" className="btn-nav-dark px-4 py-2 rounded-full text-sm font-semibold">Las Vegas conditions</Link>
      </div>
    </main>
  );
}
