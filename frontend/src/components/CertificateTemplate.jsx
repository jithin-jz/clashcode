import React, { forwardRef } from "react";
import { QRCodeSVG } from "qrcode.react";

const CertificateTemplate = forwardRef(
  (
    {
      studentName = "Student Name",
      courseName = "PYTHON MASTERY COURSE",
      completionDate = new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
      verificationUrl = "https://clashofcode.com/verify",
      isPreview = false,
    },
    ref,
  ) => {
    const containerClass = isPreview
      ? "w-[1000px] h-[707px]"
      : "w-[1000px] h-[707px]"; // A4 Landscape ratio-ish

    return (
      <div
        ref={ref}
        className={`bg-[#FDFBF7] text-black relative overflow-hidden shadow-2xl ${containerClass} mx-auto font-serif`}
      >
        {/* Outer Border (Thick Gold) */}
        <div className="absolute inset-4 border-[8px] border-[#B48C45] pointer-events-none"></div>

        {/* Inner Border (Thin Gold) */}
        <div className="absolute inset-8 border-[2px] border-[#B48C45] pointer-events-none"></div>

        {/* Corner Decorations */}
        <div className="absolute top-8 left-8 w-4 h-4 bg-[#B48C45] rounded-full"></div>
        <div className="absolute top-8 right-8 w-4 h-4 bg-[#B48C45] rounded-full"></div>
        <div className="absolute bottom-8 left-8 w-4 h-4 bg-[#B48C45] rounded-full"></div>
        <div className="absolute bottom-8 right-8 w-4 h-4 bg-[#B48C45] rounded-full"></div>

        <div className="flex flex-col items-center justify-center h-full pt-12 pb-8 text-center px-16 relative z-10">
          {/* Title */}
          <h1
            className="text-5xl font-bold text-[#1A1A1A] mb-8 font-playfair tracking-wide"
            style={{ fontFamily: '"Playfair Display", serif' }}
          >
            CERTIFICATE OF COMPLETION
          </h1>

          {/* Subtitle */}
          <p
            className="text-xl text-[#666666] mb-8 italic"
            style={{ fontFamily: '"Playfair Display", serif' }}
          >
            This certifies that
          </p>

          {/* Student Name */}
          <div className="relative mb-2">
            {/* Shadow Layers for 3D effect */}
            <h2
              className="absolute top-1 left-1 w-full text-7xl font-bold text-black/20 blur-[1px] select-none"
              style={{ fontFamily: '"Playfair Display", serif' }}
            >
              {studentName}
            </h2>
            <h2
              className="text-7xl font-bold text-[#9E7E43] relative z-10 tracking-wider uppercase"
              style={{
                fontFamily: '"Playfair Display", serif',
                textShadow: "2px 2px 0px #5C4033, 4px 4px 4px rgba(0,0,0,0.2)",
              }}
            >
              {studentName}
            </h2>
          </div>

          {/* Underline */}
          <div className="w-1/2 h-1 bg-[#B48C45] mb-10 mt-2 mx-auto rounded-full"></div>

          {/* Body Text */}
          <p
            className="text-xl text-[#666666] mb-6"
            style={{ fontFamily: '"Playfair Display", serif' }}
          >
            Has successfully completed the curriculum for
          </p>

          {/* Course Name */}
          <h3
            className="text-4xl font-bold text-[#1A1A1A] mb-12 tracking-wide"
            style={{ fontFamily: '"Playfair Display", serif' }}
          >
            {courseName}
          </h3>

          {/* Footer Grid */}
          <div className="w-full flex justify-between items-end mt-auto px-12">
            {/* Date */}
            <div className="text-center w-48">
              <p
                className="text-2xl font-bold text-[#1A1A1A] mb-2 border-b-2 border-[#B48C45] pb-2 text-nowrap"
                style={{ fontFamily: '"Playfair Display", serif' }}
              >
                {completionDate}
              </p>
              <p className="text-sm text-[#666666] font-inter uppercase tracking-widest">
                Date of Issue
              </p>
            </div>

            {/* QR Code */}
            <div className="mb-2 p-2 bg-[#ffffff] border border-[#B48C45] rounded-sm shadow-sm">
              <QRCodeSVG value={verificationUrl} size={90} fgColor="#1A1A1A" />
            </div>

            {/* Signature */}
            <div className="text-center w-48">
              CLASHCODE
              <div className="w-full h-[2px] bg-[#B48C45] mb-2"></div>
              <p className="text-sm text-[#666666] font-inter uppercase tracking-widest">
                Platform
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

export default CertificateTemplate;
