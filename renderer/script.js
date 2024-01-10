const canvas = document.querySelector('canvas'),
  toolBtns = document.querySelectorAll('.tool'),
  fillColor = document.querySelector('#fill-color'),
  sizeSlider = document.querySelector('#size-slider'),
  colorBtns = document.querySelectorAll('.colors .option'),
  colorPicker = document.querySelector('#color-picker'),
  clearCanvas = document.querySelector('.clear-canvas'),
  saveImg = document.querySelector('.save-img'),
  ctx = canvas.getContext('2d');
  ctx.fillStyle = "#1b1b1b";
  ctx.fillRect(0,0,canvas.width,canvas.height);
 


// Define default sizes for the pen and eraser
const defaultPenSize = 5;
const defaultEraserSize = 20;

let prevMouseX,
  prevMouseY,
  snapshot,
  isDrawing = false,
  selectedTool = 'brush',
  brushWidth = defaultPenSize,
  selectedColor = 'white',
  isEraser = false,
  maxEraserWidth = 100;

  const toggleEraser = () => {
    isEraser = !isEraser;
    selectedTool = isEraser ? 'eraser' : 'brush';
    if (isEraser) {
      brushWidth = maxEraserWidth;
      sizeSlider.value = maxEraserWidth;
    } else {
      brushWidth = defaultPenSize;
      sizeSlider.value = defaultPenSize;
    }
    selectedColor = isEraser ? 'grey' : 'black';
  };
  

const resetSizeSlider = () => {
  sizeSlider.value = selectedTool === 'brush' ? defaultPenSize : defaultEraserSize;
};

/*defining takesnapshot() function before being called in start draw */
function takeSnapshot() {
  const currentSnapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
  drawingActions.push(currentSnapshot); // Save the current canvas state for undo
}




const drawRect = (e) => {
    if (!fillColor.checked) {
        return ctx.strokeRect(
            e.clientX - canvas.getBoundingClientRect().left,
            e.clientY - canvas.getBoundingClientRect().top,
            prevMouseX - (e.clientX - canvas.getBoundingClientRect().left),
            prevMouseY - (e.clientY - canvas.getBoundingClientRect().top)
        );
    }
    ctx.fillRect(
        e.clientX - canvas.getBoundingClientRect().left,
        e.clientY - canvas.getBoundingClientRect().top,
        prevMouseX - (e.clientX - canvas.getBoundingClientRect().left),
        prevMouseY - (e.clientY - canvas.getBoundingClientRect().top)
    );
};

const drawCircle = (e) => {
    ctx.beginPath();
    let radius = Math.sqrt(
        Math.pow(prevMouseX - e.clientX, 2) +
        Math.pow(prevMouseY - e.clientY, 2)
    );
    ctx.arc(
        prevMouseX,
        prevMouseY,
        radius,
        0,
        2 * Math.PI
    );
    fillColor.checked ? ctx.fill() : ctx.stroke();
};

const drawTriangle = (e) => {
    ctx.beginPath();
    ctx.moveTo(prevMouseX, prevMouseY);
    ctx.lineTo(e.clientX, e.clientY);
    ctx.lineTo(prevMouseX * 2 - e.clientX, e.clientY);
    ctx.closePath();
    fillColor.checked ? ctx.fill() : ctx.stroke();
};

function getCanvasCoordinates(event) {
  const rect = canvas.getBoundingClientRect();
  if (event.touches && event.touches[0]) {
      return {
          x: event.touches[0].clientX - rect.left,
          y: event.touches[0].clientY - rect.top
      };
  } else {
      return {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top
      };
  }
}


const startDraw = (e) => {
    isDrawing = true;
    const coordinates = getCanvasCoordinates(e);
    prevMouseX = coordinates.x;
    prevMouseY = coordinates.y;
    prevMouseX = e.clientX - canvas.getBoundingClientRect().left;
    prevMouseY = e.clientY - canvas.getBoundingClientRect().top;
    ctx.beginPath();
    ctx.lineWidth = brushWidth;
    ctx.strokeStyle = selectedColor;
    ctx.fillStyle = selectedColor;
    snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    takeSnapshot();
};

const drawing = (e) => {
    if (!isDrawing) return;
    const coordinates = getCanvasCoordinates(e);
    ctx.putImageData(snapshot, 0, 0);
    if (selectedTool === "brush") {
        ctx.strokeStyle = selectedColor;
        ctx.lineTo(e.clientX - canvas.getBoundingClientRect().left, e.clientY - canvas.getBoundingClientRect().top);
        ctx.stroke();
    } else if (selectedTool === "eraser") {
        if (isEraser) {
            ctx.clearRect(
                e.clientX - canvas.getBoundingClientRect().left - brushWidth / 2,
                e.clientY - canvas.getBoundingClientRect().top - brushWidth / 2,
                brushWidth,
                brushWidth
            );
        } else {
            ctx.globalCompositeOperation = 'destination-out'; // Set composite operation to erase
            ctx.lineTo(e.clientX - canvas.getBoundingClientRect().left, e.clientY - canvas.getBoundingClientRect().top);
            ctx.stroke();
            ctx.globalCompositeOperation = 'source-over'; // Reset composite operation to default
        }
    } else if (selectedTool === "rectangle") {
        drawRect(e);
    } else if (selectedTool === "circle") {
        drawCircle(e);
    } else {
        drawTriangle(e);
    }
    takeSnapshot();
};

toolBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelector(".options .active").classList.remove("active");
        btn.classList.add("active");
        selectedTool = btn.id;
        // Set default color to white when brush tool is selected
        selectedColor = selectedTool === "brush" ? "white" : selectedColor;
        sizeSlider.value = selectedTool === "brush" ? 5 : sizeSlider.value;
    });
});
  
  sizeSlider.addEventListener('change', () => {
    brushWidth = sizeSlider.value;
    if (selectedTool === 'eraser') {
      maxEraserWidth = sizeSlider.value;
    }
  });
  
  colorBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelector('.options .selected').classList.remove('selected');
      btn.classList.add('selected');
      selectedColor = window.getComputedStyle(btn).getPropertyValue('background-color');
    });
  });
  
  colorPicker.addEventListener('change', () => {
    colorPicker.parentElement.style.background = colorPicker.value;
    colorPicker.parentElement.click();
  });
  
  clearCanvas.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setCanvasBackground();
    takeSnapshot();
  });
  
  saveImg.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = `${Date.now()}.jpg`;
    link.href = canvas.toDataURL();
    link.click();
  });
  
  canvas.addEventListener('mousedown', startDraw);
  canvas.addEventListener('mousemove', drawing);
  canvas.addEventListener('mouseup', () => (isDrawing = false));
  
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (e.touches.length === 1) {
      toggleEraser();
      startDraw(e.touches[0]);
    }
  });
  
  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    drawing(e.touches[0]);
  });
  
  canvas.addEventListener('touchend', () => (isDrawing = false));
  
  window.addEventListener('load', () => {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    takeSnapshot();
  });
  
 // ... (Previous code)

const drawingActions = [];
const redoActions = [];

function undo() {
  if (drawingActions.length > 0) {
      
      const lastAction = drawingActions.pop();
      redoActions.push(lastAction);
      redrawCanvas();
  }
}

function redo() {
  if (redoActions.length > 0) {
      const lastRedoAction = redoActions.pop();
      drawingActions.push(lastRedoAction);
      redrawCanvas();
  }
}



function redrawCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawingActions.forEach(action => {
      ctx.putImageData(action, 0, 0);
  });
}






document.querySelector('.undo-btn').addEventListener('click', undo);
document.querySelector('.redo-btn').addEventListener('click', redo);

// Rest of your code...



/* */
/*underneath are the functions for toggling tools board*/
document.addEventListener("DOMContentLoaded", function() {
    const toggleButton = document.querySelector(".toggle-tools");
    const toolsBoard = document.querySelector(".tools-board");
  
    toggleButton.addEventListener("click", function() {
      toolsBoard.classList.toggle("show-tools");
    });
  });
  