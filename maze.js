class Cell {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.walls = { top: true, right: true, bottom: true, left: true };
        this.visited = false;
    }
}

class Maze {
    constructor(width, height, cellSize) {
        this.width = width;
        this.height = height;
        this.cellSize = cellSize;
        this.wallThickness = 6; // Reduced wall thickness
        this.grid = [];
        this.canvas = document.getElementById('mazeCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size
        this.canvas.width = width * cellSize;
        this.canvas.height = height * cellSize;
        
        this.initializeGrid();
        this.generateMaze();
    }

    initializeGrid() {
        for (let y = 0; y < this.height; y++) {
            this.grid[y] = [];
            for (let x = 0; x < this.width; x++) {
                this.grid[y][x] = new Cell(x, y);
            }
        }
    }

    getNeighbors(cell) {
        const neighbors = [];
        const { x, y } = cell;

        // Check adjacent cells
        if (y > 0) neighbors.push({ cell: this.grid[y - 1][x], direction: 'top' });
        if (x < this.width - 1) neighbors.push({ cell: this.grid[y][x + 1], direction: 'right' });
        if (y < this.height - 1) neighbors.push({ cell: this.grid[y + 1][x], direction: 'bottom' });
        if (x > 0) neighbors.push({ cell: this.grid[y][x - 1], direction: 'left' });

        return neighbors.filter(n => !n.cell.visited);
    }

    removeWalls(current, next, direction) {
        current.walls[direction] = false;
        const opposite = {
            'top': 'bottom',
            'right': 'left',
            'bottom': 'top',
            'left': 'right'
        };
        next.walls[opposite[direction]] = false;
    }

    generateMaze() {
        const stack = [];
        const startCell = this.grid[0][0];
        startCell.visited = true;
        stack.push(startCell);

        while (stack.length > 0) {
            const current = stack[stack.length - 1];
            const neighbors = this.getNeighbors(current);

            if (neighbors.length === 0) {
                stack.pop();
                continue;
            }

            const { cell: next, direction } = neighbors[Math.floor(Math.random() * neighbors.length)];
            next.visited = true;
            this.removeWalls(current, next, direction);
            stack.push(next);
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#000';
        
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const cell = this.grid[y][x];
                const x1 = x * this.cellSize;
                const y1 = y * this.cellSize;
                const x2 = x1 + this.cellSize;
                const y2 = y1 + this.cellSize;

                if (cell.walls.top) {
                    this.ctx.fillRect(x1, y1, this.cellSize, this.wallThickness);
                }
                if (cell.walls.right) {
                    this.ctx.fillRect(x2 - this.wallThickness, y1, this.wallThickness, this.cellSize);
                }
                if (cell.walls.bottom) {
                    this.ctx.fillRect(x1, y2 - this.wallThickness, this.cellSize, this.wallThickness);
                }
                if (cell.walls.left) {
                    this.ctx.fillRect(x1, y1, this.wallThickness, this.cellSize);
                }
            }
        }
    }
}

// Create and draw the maze when the page loads
window.onload = () => {
    const maze = new Maze(12, 12, 50); // Adjusted to 12x12 grid with 50px cells
    maze.draw();
}; 