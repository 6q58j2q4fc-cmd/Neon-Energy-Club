import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Check, 
  X,
  Move
} from "lucide-react";

interface ImageCropperProps {
  imageSrc: string;
  onCropComplete: (croppedImage: string) => void;
  onCancel: () => void;
  aspectRatio?: number; // Default 1 for square
  outputSize?: number; // Default 400px
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function ImageCropper({
  imageSrc,
  onCropComplete,
  onCancel,
  aspectRatio = 1,
  outputSize = 400,
}: ImageCropperProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [containerSize, setContainerSize] = useState({ width: 300, height: 300 });

  // Load image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imageRef.current = img;
      setImageLoaded(true);
      
      // Calculate initial zoom to fit image in container
      const containerWidth = containerSize.width;
      const containerHeight = containerSize.height;
      const scale = Math.max(
        containerWidth / img.width,
        containerHeight / img.height
      );
      setZoom(scale);
    };
    img.src = imageSrc;
  }, [imageSrc, containerSize]);

  // Update container size on mount
  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setContainerSize({ width: rect.width, height: rect.height });
    }
  }, []);

  // Draw image on canvas
  const drawImage = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const img = imageRef.current;
    
    if (!canvas || !ctx || !img || !imageLoaded) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Save context state
    ctx.save();
    
    // Move to center
    ctx.translate(canvas.width / 2, canvas.height / 2);
    
    // Apply rotation
    ctx.rotate((rotation * Math.PI) / 180);
    
    // Apply zoom and position
    const scaledWidth = img.width * zoom;
    const scaledHeight = img.height * zoom;
    
    ctx.drawImage(
      img,
      -scaledWidth / 2 + position.x,
      -scaledHeight / 2 + position.y,
      scaledWidth,
      scaledHeight
    );
    
    // Restore context state
    ctx.restore();
    
    // Draw crop overlay
    drawCropOverlay(ctx, canvas.width, canvas.height);
  }, [zoom, rotation, position, imageLoaded]);

  // Draw crop overlay
  const drawCropOverlay = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const cropSize = Math.min(width, height) * 0.8;
    const cropX = (width - cropSize) / 2;
    const cropY = (height - cropSize) / 2;
    
    // Semi-transparent overlay
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    
    // Top
    ctx.fillRect(0, 0, width, cropY);
    // Bottom
    ctx.fillRect(0, cropY + cropSize, width, height - cropY - cropSize);
    // Left
    ctx.fillRect(0, cropY, cropX, cropSize);
    // Right
    ctx.fillRect(cropX + cropSize, cropY, width - cropX - cropSize, cropSize);
    
    // Crop border
    ctx.strokeStyle = "#c8ff00";
    ctx.lineWidth = 2;
    ctx.strokeRect(cropX, cropY, cropSize, cropSize);
    
    // Corner handles
    const handleSize = 12;
    ctx.fillStyle = "#c8ff00";
    
    // Top-left
    ctx.fillRect(cropX - handleSize / 2, cropY - handleSize / 2, handleSize, handleSize);
    // Top-right
    ctx.fillRect(cropX + cropSize - handleSize / 2, cropY - handleSize / 2, handleSize, handleSize);
    // Bottom-left
    ctx.fillRect(cropX - handleSize / 2, cropY + cropSize - handleSize / 2, handleSize, handleSize);
    // Bottom-right
    ctx.fillRect(cropX + cropSize - handleSize / 2, cropY + cropSize - handleSize / 2, handleSize, handleSize);
    
    // Grid lines (rule of thirds)
    ctx.strokeStyle = "rgba(200, 255, 0, 0.3)";
    ctx.lineWidth = 1;
    
    // Vertical lines
    ctx.beginPath();
    ctx.moveTo(cropX + cropSize / 3, cropY);
    ctx.lineTo(cropX + cropSize / 3, cropY + cropSize);
    ctx.moveTo(cropX + (cropSize * 2) / 3, cropY);
    ctx.lineTo(cropX + (cropSize * 2) / 3, cropY + cropSize);
    ctx.stroke();
    
    // Horizontal lines
    ctx.beginPath();
    ctx.moveTo(cropX, cropY + cropSize / 3);
    ctx.lineTo(cropX + cropSize, cropY + cropSize / 3);
    ctx.moveTo(cropX, cropY + (cropSize * 2) / 3);
    ctx.lineTo(cropX + cropSize, cropY + (cropSize * 2) / 3);
    ctx.stroke();
  };

  // Redraw when dependencies change
  useEffect(() => {
    drawImage();
  }, [drawImage]);

  // Handle mouse/touch events for dragging
  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    setDragStart({ x: clientX - position.x, y: clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    setPosition({
      x: clientX - dragStart.x,
      y: clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Crop and export image
  const handleCrop = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    
    if (!canvas || !img) return;

    // Create output canvas
    const outputCanvas = document.createElement("canvas");
    outputCanvas.width = outputSize;
    outputCanvas.height = outputSize;
    const outputCtx = outputCanvas.getContext("2d");
    
    if (!outputCtx) return;

    // Calculate crop area
    const cropSize = Math.min(canvas.width, canvas.height) * 0.8;
    const cropX = (canvas.width - cropSize) / 2;
    const cropY = (canvas.height - cropSize) / 2;

    // Draw cropped area to output canvas
    outputCtx.drawImage(
      canvas,
      cropX,
      cropY,
      cropSize,
      cropSize,
      0,
      0,
      outputSize,
      outputSize
    );

    // Export as base64
    const croppedImage = outputCanvas.toDataURL("image/jpeg", 0.9);
    onCropComplete(croppedImage);
  };

  // Zoom controls
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#1a1a1a] rounded-2xl p-6 max-w-lg w-full border border-white/10">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Move className="h-5 w-5 text-[#c8ff00]" />
          Crop Your Photo
        </h3>
        
        <p className="text-white/60 text-sm mb-4">
          Drag to position your photo within the crop area. Use the controls below to zoom and rotate.
        </p>
        
        {/* Canvas Container */}
        <div 
          ref={containerRef}
          className="relative w-full aspect-square bg-black rounded-xl overflow-hidden mb-4 cursor-move"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseUp}
        >
          <canvas
            ref={canvasRef}
            width={containerSize.width}
            height={containerSize.height}
            className="w-full h-full"
          />
        </div>
        
        {/* Zoom Slider */}
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="outline"
            size="icon"
            onClick={handleZoomOut}
            className="border-white/20 text-white hover:bg-white/10"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          
          <Slider
            value={[zoom]}
            onValueChange={([value]) => setZoom(value)}
            min={0.5}
            max={3}
            step={0.01}
            className="flex-1"
          />
          
          <Button
            variant="outline"
            size="icon"
            onClick={handleZoomIn}
            className="border-white/20 text-white hover:bg-white/10"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={handleRotate}
            className="border-white/20 text-white hover:bg-white/10"
          >
            <RotateCw className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1 border-white/20 text-white hover:bg-white/10"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleCrop}
            className="flex-1 bg-[#c8ff00] text-black hover:bg-[#a8d600]"
          >
            <Check className="h-4 w-4 mr-2" />
            Apply Crop
          </Button>
        </div>
      </div>
    </div>
  );
}
