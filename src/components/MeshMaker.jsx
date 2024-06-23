import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";

const GradientMeshGenerator = () => {
  const [colors, setColors] = useState([]);
  const [newColor, setNewColor] = useState("#000000");
  const [pointsPerColor, setPointsPerColor] = useState(5);
  const [interpolationMethod, setInterpolationMethod] = useState("linear");
  const [canvasSize, setCanvasSize] = useState("square");
  const canvasRef = useRef(null);

  const canvasSizes = useMemo(() => ({
    square: { width: 1080, height: 1080, label: "Square (1080x1080)" },
    igReel: { width: 1080, height: 1920, label: "Instagram Reel (1080x1920)" },
    twitterPost: { width: 1200, height: 675, label: "Twitter Post (1200x675)" },
  }), []);

  const addColor = useCallback(() => {
    setColors((prevColors) => [...prevColors, newColor]);
    setNewColor("#000000");
  }, [newColor]);

  const removeColor = useCallback((index) => {
    setColors((prevColors) => prevColors.filter((_, i) => i !== index));
  }, []);

  useEffect(() => {
    if (colors.length > 1) {
      generateRandomMesh();
    }
  }, [colors, pointsPerColor, interpolationMethod, canvasSize]);

  const generateRandomMesh = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const { width, height } = canvasSizes[canvasSize];

    canvas.width = width;
    canvas.height = height;

    ctx.clearRect(0, 0, width, height);

    const points = colors.flatMap((color) =>
      Array.from({ length: pointsPerColor }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        color,
      }))
    );

    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        let totalWeight = 0;
        let r = 0, g = 0, b = 0;

        points.forEach((point) => {
          const dx = x - point.x;
          const dy = y - point.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const weight = Math.max(0.1, 1 - distance / (Math.max(width, height) / 2));

          totalWeight += weight;
          r += weight * parseInt(point.color.slice(1, 3), 16);
          g += weight * parseInt(point.color.slice(3, 5), 16);
          b += weight * parseInt(point.color.slice(5, 7), 16);
        });

        r = Math.min(255, r / totalWeight);
        g = Math.min(255, g / totalWeight);
        b = Math.min(255, b / totalWeight);

        const index = (y * width + x) * 4;
        data[index] = r;
        data[index + 1] = g;
        data[index + 2] = b;
        data[index + 3] = 255;
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }, [canvasSize, colors, pointsPerColor, canvasSizes]);

  const downloadCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const image = canvas.toDataURL("image/png");
    const link = document.createElement('a');
    link.href = image;
    link.download = 'gradient-mesh.png';
    link.click();
  }, []);

  return (
    <div className="min-h-screen bg-[#F5E6D3] p-8 font-sans">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl p-8">
        <h1 className="text-5xl font-black mb-8 text-center text-[#2C3E50] tracking-tight">
          Gradient Mesh Maker
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <div className="mb-8">
              <label className="block text-2xl font-bold mb-3 text-[#2C3E50]">Add a new color</label>
              <div className="flex">
                <input
                  type="color"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  className="mr-3 w-20 h-14 rounded-lg border-4 border-[#2C3E50] focus:border-[#3498DB] focus:outline-none"
                />
                <button
                  onClick={addColor}
                  className="flex-grow bg-[#3498DB] hover:bg-[#2980B9] text-white font-bold py-3 px-6 rounded-lg transition duration-300 text-lg"
                >
                  Add Color
                </button>
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-2xl font-bold mb-3 text-[#2C3E50]">
                Points per Color: {pointsPerColor}
              </label>
              <input
                type="range"
                min={1}
                max={20}
                step={1}
                value={pointsPerColor}
                onChange={(e) => setPointsPerColor(Number(e.target.value))}
                className="w-full h-3 bg-[#BDC3C7] rounded-full appearance-none cursor-pointer"
              />
            </div>

            <div className="mb-8">
              <label className="block text-2xl font-bold mb-3 text-[#2C3E50]">Canvas Size</label>
              <select
                value={canvasSize}
                onChange={(e) => setCanvasSize(e.target.value)}
                className="w-full bg-white border-4 border-[#2C3E50] rounded-lg py-3 px-4 focus:outline-none focus:border-[#3498DB] text-lg"
              >
                {Object.entries(canvasSizes).map(([key, { label }]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <button
              onClick={generateRandomMesh}
              className="w-full bg-[#E74C3C] hover:bg-[#C0392B] text-white font-bold py-4 px-6 rounded-lg mb-8 transition duration-300 text-xl"
            >
              Generate New Mesh
            </button>

            <div className="grid grid-cols-2 gap-4">
              {colors.map((color, index) => (
                <div key={index} className="flex items-center p-4 bg-[#ECF0F1] rounded-lg shadow-md">
                  <div
                    className="w-10 h-10 mr-3 rounded-full border-4 border-[#2C3E50]"
                    style={{ backgroundColor: color }}
                  ></div>
                  <span className="mr-2 flex-grow text-[#2C3E50] font-bold">{color}</span>
                  <button
                    onClick={() => removeColor(index)}
                    className="text-[#E74C3C] hover:text-[#C0392B] font-bold text-xl"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="relative" style={{ paddingTop: `${(canvasSizes[canvasSize].height / canvasSizes[canvasSize].width) * 100}%` }}>
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full rounded-2xl shadow-xl cursor-pointer"
                onClick={downloadCanvas}
                title="Click to download"
              ></canvas>
            </div>
            <p className="text-center mt-4 text-lg font-medium text-[#2C3E50]">Click on the image to download</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GradientMeshGenerator;