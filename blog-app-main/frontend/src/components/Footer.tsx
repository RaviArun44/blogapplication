export const Footer = () => {
  return (
    <footer className="bottom-0 left-0 right-0 bg-black/50 text-white backdrop-blur-md z-30 shadow-sm mt-10">
      <div className="container mx-auto px-4 py-4 text-center">
        <p className="text-md">
          © {new Date().getFullYear()} Aravinth Raj R. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
