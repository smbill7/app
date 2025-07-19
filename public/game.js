class Snake {
    constructor(x, y) {
        this.segments = [{x, y}];
        this.direction = {x: 1, y: 0};
        this.score = 0;
        this.growing = false;
    }

    move() {
        const head = this.segments[0];
        const newHead = {
            x: head.x + this.direction.x,
            y: head.y + this.direction.y
        };
        this.segments.unshift(newHead);
        if (!this.growing) {
            this.segments.pop();
        }
        this.growing = false;
    }

    grow() {
        this.growing = true;
        this.score += 10;
    }

    checkCollision(width, height) {
        const head = this.segments[0];
        // 벽과의 충돌 체크
        if (head.x < 0 || head.x >= width || head.y < 0 || head.y >= height) {
            return true;
        }
        // 자신의 몸과의 충돌 체크 (머리를 제외한 나머지 부분과의 충돌)
        for (let i = 1; i < this.segments.length; i++) {
            if (head.x === this.segments[i].x && head.y === this.segments[i].y) {
                return true;
            }
        }
        return false;
    }

    isPositionOccupied(x, y) {
        return this.segments.some(segment => segment.x === x && segment.y === y);
    }
}

class Food {
    constructor() {
        this.position = {x: 0, y: 0};
    }

    randomize(width, height, snake) {
        let newX, newY;
        do {
            newX = Math.floor(Math.random() * width);
            newY = Math.floor(Math.random() * height);
        } while (snake.isPositionOccupied(newX, newY));
        
        this.position.x = newX;
        this.position.y = newY;
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('scoreValue');
        
        this.gridSize = 20;
        this.canvas.width = 800;
        this.canvas.height = 600;
        
        this.width = this.canvas.width / this.gridSize;
        this.height = this.canvas.height / this.gridSize;
        
        this.snake = new Snake(Math.floor(this.width / 2), Math.floor(this.height / 2));
        this.food = new Food();
        this.food.randomize(this.width, this.height, this.snake);
        
        this.bindControls();
        this.lastTime = 0;
        this.accumulator = 0;
        this.timestep = 100; // 뱀의 이동 속도 (밀리초)
        this.isPaused = false;
        
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    bindControls() {
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowUp':
                    if (this.snake.direction.y !== 1) {
                        this.snake.direction = {x: 0, y: -1};
                    }
                    break;
                case 'ArrowDown':
                    if (this.snake.direction.y !== -1) {
                        this.snake.direction = {x: 0, y: 1};
                    }
                    break;
                case 'ArrowLeft':
                    if (this.snake.direction.x !== 1) {
                        this.snake.direction = {x: -1, y: 0};
                    }
                    break;
                case 'ArrowRight':
                    if (this.snake.direction.x !== -1) {
                        this.snake.direction = {x: 1, y: 0};
                    }
                    break;
            }
        });
    }

    update() {
        // 먹이를 먹었는지 체크
        const head = this.snake.segments[0];
        if (head.x === this.food.position.x && head.y === this.food.position.y) {
            this.snake.grow();
            this.food.randomize(this.width, this.height, this.snake);
            this.scoreElement.textContent = this.snake.score;
        }

        // 이동 후 충돌 체크
        this.snake.move();
        
        // 벽이나 자신의 몸과 충돌했을 때만 게임 오버
        if (this.snake.checkCollision(this.width, this.height)) {
            const playAgain = confirm('게임 오버! 점수: ' + this.snake.score + '\n다시 시작하시겠습니까?');
            if (playAgain) {
                this.reset();
            } else {
                this.pause();
            }
        }
    }

    draw() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 뱀 그리기
        this.ctx.fillStyle = '#00ff00';
        for (const segment of this.snake.segments) {
            this.ctx.fillRect(
                segment.x * this.gridSize,
                segment.y * this.gridSize,
                this.gridSize - 1,
                this.gridSize - 1
            );
        }
        
        // 먹이 그리기
        this.ctx.fillStyle = '#ff0000';
        this.ctx.fillRect(
            this.food.position.x * this.gridSize,
            this.food.position.y * this.gridSize,
            this.gridSize - 1,
            this.gridSize - 1
        );
    }

    gameLoop(currentTime) {
        if (this.lastTime && !this.isPaused) {
            const deltaTime = currentTime - this.lastTime;
            this.accumulator += deltaTime;
            
            while (this.accumulator >= this.timestep) {
                this.update();
                this.accumulator -= this.timestep;
            }
        }
        
        this.lastTime = currentTime;
        this.draw();
        if (!this.isPaused) {
            requestAnimationFrame(this.gameLoop.bind(this));
        }
    }

    reset() {
        this.snake = new Snake(Math.floor(this.width / 2), Math.floor(this.height / 2));
        this.food.randomize(this.width, this.height, this.snake);
        this.scoreElement.textContent = '0';
        this.isPaused = false;
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    pause() {
        this.isPaused = true;
    }
}

// 게임 시작
new Game(); 