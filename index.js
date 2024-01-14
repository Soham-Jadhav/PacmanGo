const displayScores = document.getElementById('displayScores');
const score = document.getElementById('score');
const highscore = document.getElementById('hscore');
const startGameButton = document.getElementById('startGameButton');
const displayTextElem = document.getElementById('displayText');
const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');

// canvas.width = innerWidth;
// canvas.height = innerHeight;
canvas.width = 440;
canvas.height = 520;

class Boundary {
    static width = 40;
    static height = 40;

    constructor({ position, image }) {
        this.position = position;
        this.width = 40;
        this.height = 40;
        this.image = image;
    }

    draw() {
        // context.fillStyle = 'blue';
        // context.fillRect(this.position.x, this.position.y, this.width, this.height);
        context.drawImage(this.image, this.position.x, this.position.y);
    }
};

class Pacman {
    constructor({ position, velocity }) {
        this.position = position;
        this.velocity = velocity;
        this.radius = 15;
        this.radians = 0.75;
        this.openRate = 0.12;
        this.rotation = 0;
    }

    draw() {
        context.save();
        context.translate(this.position.x, this.position.y);
        context.rotate(this.rotation);
        context.translate(-this.position.x, -this.position.y);
        context.beginPath();
        context.arc(this.position.x, this.position.y, this.radius, this.radians, 2 * Math.PI - this.radians);
        context.lineTo(this.position.x, this.position.y);
        context.fillStyle = 'yellow';
        context.fill();
        context.closePath();
        context.restore();
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        if (this.radians <= 0.0 || this.radians >= 0.75) {
            this.openRate *= -1;
        }

        this.radians += this.openRate;
    }
};

class Ghost {
    static speed = 2;

    constructor({ position, velocity, color = 'red' }) {
        this.position = position;
        this.velocity = velocity;
        this.radius = 15;
        this.color = color;
        this.prevCollusion = [];
        this.speed = 2;
        this.scared = false;
    }

    draw() {
        context.beginPath();
        context.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI);
        context.fillStyle = (this.scared ? 'blue' : this.color);
        context.fill();
        context.closePath();
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
};

class Pellet {
    constructor({ position }) {
        this.position = position;
        this.radius = 3;
    }

    draw() {
        context.beginPath();
        context.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI);
        context.fillStyle = 'white';
        context.fill();
        context.closePath();
    }
};

class PowerUp {
    constructor({ position }) {
        this.position = position;
        this.radius = 7;
    }

    draw() {
        context.beginPath();
        context.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI);
        context.fillStyle = 'white';
        context.fill();
        context.closePath();
    }
};

const map = [
    ['1', '-', '-', '-', '-', '-', '2'],
    ['|', ' ', ' ', ' ', ' ', ' ', '|'],
    ['|', ' ', 'b', ' ', 'b', ' ', '|'],
    ['|', ' ', ' ', ' ', ' ', ' ', '|'],
    ['|', ' ', 'b', ' ', 'b', ' ', '|'],
    ['|', ' ', ' ', ' ', ' ', ' ', '|'],
    ['4', '-', '-', '-', '-', '-', '3'],
];

const map1 = [
    ['1', '-', '-', '-', '-', '-', '-', '-', '-', '-', '2'],
    ['|', '.', '.', '.', '.', '.', '.', '.', '.', '.', '|'],
    ['|', '.', 'b', '.', '[', '7', ']', '.', 'b', '.', '|'],
    ['|', '.', '.', '.', '.', '_', '.', '.', '.', '.', '|'],
    ['|', '.', '[', ']', '.', '.', '.', '[', ']', '.', '|'],
    ['|', '.', '.', '.', '.', '^', '.', '.', '.', '.', '|'],
    ['|', '.', 'b', '.', '[', '+', ']', '.', 'b', '.', '|'],
    ['|', '.', '.', '.', '.', '_', '.', '.', '.', '.', '|'],
    ['|', '.', '[', ']', '.', '.', '.', '[', ']', '.', '|'],
    ['|', '.', '.', '.', '.', '^', '.', '.', '.', '.', '|'],
    ['|', '.', 'b', '.', '[', '5', ']', '.', 'b', '.', '|'],
    ['|', '.', '.', '.', '.', '.', '.', '.', '.', 'p', '|'],
    ['4', '-', '-', '-', '-', '-', '-', '-', '-', '-', '3']
];

let keys = {
    w: {
        pressed: false
    },
    a: {
        pressed: false
    },
    d: {
        pressed: false
    },
    s: {
        pressed: false
    }
}

let scores = 0;
let lastKey = '';
let scaredTimer = 0;

let ghosts = [
    new Ghost({
        position: { x: Boundary.width * 6 + Boundary.width / 2, y: Boundary.height + Boundary.height / 2 },
        velocity: { x: Ghost.speed, y: 0 }
    }),
    new Ghost({
        position: { x: Boundary.width * 6 + Boundary.width / 2, y: Boundary.height * 3 + Boundary.height / 2 },
        velocity: { x: Ghost.speed, y: 0 },
        color: 'pink'
    }),
    new Ghost({
        position: { x: Boundary.width * 3 + Boundary.width / 2, y: Boundary.height * 9 + Boundary.height / 2 },
        velocity: { x: Ghost.speed, y: 0 },
        color: 'green'
    }),
];
let pellets = [];
let powerUps = [];
let boundaries = [];
let pacman = new Pacman({
    position: { x: Boundary.width + Boundary.width / 2, y: Boundary.height + Boundary.height / 2 },
    velocity: { x: 0, y: 0 }
});

function init() {
    keys = {
        w: {
            pressed: false
        },
        a: {
            pressed: false
        },
        d: {
            pressed: false
        },
        s: {
            pressed: false
        }
    }

    scores = 0;
    lastKey = '';
    scaredTimer = 0;

    ghosts = [
        new Ghost({
            position: { x: Boundary.width * 6 + Boundary.width / 2, y: Boundary.height + Boundary.height / 2 },
            velocity: { x: Ghost.speed, y: 0 }
        }),
        new Ghost({
            position: { x: Boundary.width * 6 + Boundary.width / 2, y: Boundary.height * 3 + Boundary.height / 2 },
            velocity: { x: Ghost.speed, y: 0 },
            color: 'pink'
        }),
        new Ghost({
            position: { x: Boundary.width * 3 + Boundary.width / 2, y: Boundary.height * 9 + Boundary.height / 2 },
            velocity: { x: Ghost.speed, y: 0 },
            color: 'green'
        }),
    ];
    pellets = [];
    powerUps = [];
    boundaries = [];
    pacman = new Pacman({
        position: { x: Boundary.width + Boundary.width / 2, y: Boundary.height + Boundary.height / 2 },
        velocity: { x: 0, y: 0 }
    });

    map1.forEach((row, rowIndex) => {
        row.forEach((symbol, symbolIndex) => {
            switch (symbol) {
                // case '-':
                //     boundaries.push(new Boundary({
                //         position: {
                //             x: symbolIndex * Boundary.width,
                //             y: rowIndex * Boundary.height
                //             // x: symbolIndex * Boundary.width + symbolIndex,
                //             // y: rowIndex * Boundary.height + rowIndex
                //         },
                //         image: createImage('./assets/pipeHorizontal.png')
                //     }));

                //     break;
                case '-':
                    boundaries.push(
                        new Boundary({
                            position: {
                                x: Boundary.width * symbolIndex,
                                y: Boundary.height * rowIndex
                            },
                            image: createImage('./assets/pipeHorizontal.png')
                        })
                    )
                    break
                case '|':
                    boundaries.push(
                        new Boundary({
                            position: {
                                x: Boundary.width * symbolIndex,
                                y: Boundary.height * rowIndex
                            },
                            image: createImage('./assets/pipeVertical.png')
                        })
                    )
                    break
                case '1':
                    boundaries.push(
                        new Boundary({
                            position: {
                                x: Boundary.width * symbolIndex,
                                y: Boundary.height * rowIndex
                            },
                            image: createImage('./assets/pipeCorner1.png')
                        })
                    )
                    break
                case '2':
                    boundaries.push(
                        new Boundary({
                            position: {
                                x: Boundary.width * symbolIndex,
                                y: Boundary.height * rowIndex
                            },
                            image: createImage('./assets/pipeCorner2.png')
                        })
                    )
                    break
                case '3':
                    boundaries.push(
                        new Boundary({
                            position: {
                                x: Boundary.width * symbolIndex,
                                y: Boundary.height * rowIndex
                            },
                            image: createImage('./assets/pipeCorner3.png')
                        })
                    )
                    break
                case '4':
                    boundaries.push(
                        new Boundary({
                            position: {
                                x: Boundary.width * symbolIndex,
                                y: Boundary.height * rowIndex
                            },
                            image: createImage('./assets/pipeCorner4.png')
                        })
                    )
                    break
                case 'b':
                    boundaries.push(
                        new Boundary({
                            position: {
                                x: Boundary.width * symbolIndex,
                                y: Boundary.height * rowIndex
                            },
                            image: createImage('./assets/block.png')
                        })
                    )
                    break
                case '[':
                    boundaries.push(
                        new Boundary({
                            position: {
                                x: symbolIndex * Boundary.width,
                                y: rowIndex * Boundary.height
                            },
                            image: createImage('./assets/capLeft.png')
                        })
                    )
                    break
                case ']':
                    boundaries.push(
                        new Boundary({
                            position: {
                                x: symbolIndex * Boundary.width,
                                y: rowIndex * Boundary.height
                            },
                            image: createImage('./assets/capRight.png')
                        })
                    )
                    break
                case '_':
                    boundaries.push(
                        new Boundary({
                            position: {
                                x: symbolIndex * Boundary.width,
                                y: rowIndex * Boundary.height
                            },
                            image: createImage('./assets/capBottom.png')
                        })
                    )
                    break
                case '^':
                    boundaries.push(
                        new Boundary({
                            position: {
                                x: symbolIndex * Boundary.width,
                                y: rowIndex * Boundary.height
                            },
                            image: createImage('./assets/capTop.png')
                        })
                    )
                    break
                case '+':
                    boundaries.push(
                        new Boundary({
                            position: {
                                x: symbolIndex * Boundary.width,
                                y: rowIndex * Boundary.height
                            },
                            image: createImage('./assets/pipeCross.png')
                        })
                    )
                    break
                case '5':
                    boundaries.push(
                        new Boundary({
                            position: {
                                x: symbolIndex * Boundary.width,
                                y: rowIndex * Boundary.height
                            },
                            color: 'blue',
                            image: createImage('./assets/pipeConnectorTop.png')
                        })
                    )
                    break
                case '6':
                    boundaries.push(
                        new Boundary({
                            position: {
                                x: symbolIndex * Boundary.width,
                                y: rowIndex * Boundary.height
                            },
                            color: 'blue',
                            image: createImage('./assets/pipeConnectorRight.png')
                        })
                    )
                    break
                case '7':
                    boundaries.push(
                        new Boundary({
                            position: {
                                x: symbolIndex * Boundary.width,
                                y: rowIndex * Boundary.height
                            },
                            color: 'blue',
                            image: createImage('./assets/pipeConnectorBottom.png')
                        })
                    )
                    break
                case '8':
                    boundaries.push(
                        new Boundary({
                            position: {
                                x: symbolIndex * Boundary.width,
                                y: rowIndex * Boundary.height
                            },
                            image: createImage('./assets/pipeConnectorLeft.png')
                        })
                    )
                    break
                case '.':
                    pellets.push(
                        new Pellet({
                            position: {
                                x: symbolIndex * Boundary.width + Boundary.width / 2,
                                y: rowIndex * Boundary.height + Boundary.height / 2
                            }
                        })
                    )
                    break
                case 'p':
                    powerUps.push(
                        new PowerUp({
                            position: {
                                x: symbolIndex * Boundary.width + Boundary.width / 2,
                                y: rowIndex * Boundary.height + Boundary.height / 2
                            }
                        })
                    )
                    break
            }
        });
    });
}

function createImage(src) {
    const image = new Image();
    image.src = src;
    return image;
}

map1.forEach((row, rowIndex) => {
    row.forEach((symbol, symbolIndex) => {
        switch (symbol) {
            // case '-':
            //     boundaries.push(new Boundary({
            //         position: {
            //             x: symbolIndex * Boundary.width,
            //             y: rowIndex * Boundary.height
            //             // x: symbolIndex * Boundary.width + symbolIndex,
            //             // y: rowIndex * Boundary.height + rowIndex
            //         },
            //         image: createImage('./assets/pipeHorizontal.png')
            //     }));

            //     break;
            case '-':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: Boundary.width * symbolIndex,
                            y: Boundary.height * rowIndex
                        },
                        image: createImage('./assets/pipeHorizontal.png')
                    })
                )
                break
            case '|':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: Boundary.width * symbolIndex,
                            y: Boundary.height * rowIndex
                        },
                        image: createImage('./assets/pipeVertical.png')
                    })
                )
                break
            case '1':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: Boundary.width * symbolIndex,
                            y: Boundary.height * rowIndex
                        },
                        image: createImage('./assets/pipeCorner1.png')
                    })
                )
                break
            case '2':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: Boundary.width * symbolIndex,
                            y: Boundary.height * rowIndex
                        },
                        image: createImage('./assets/pipeCorner2.png')
                    })
                )
                break
            case '3':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: Boundary.width * symbolIndex,
                            y: Boundary.height * rowIndex
                        },
                        image: createImage('./assets/pipeCorner3.png')
                    })
                )
                break
            case '4':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: Boundary.width * symbolIndex,
                            y: Boundary.height * rowIndex
                        },
                        image: createImage('./assets/pipeCorner4.png')
                    })
                )
                break
            case 'b':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: Boundary.width * symbolIndex,
                            y: Boundary.height * rowIndex
                        },
                        image: createImage('./assets/block.png')
                    })
                )
                break
            case '[':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: symbolIndex * Boundary.width,
                            y: rowIndex * Boundary.height
                        },
                        image: createImage('./assets/capLeft.png')
                    })
                )
                break
            case ']':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: symbolIndex * Boundary.width,
                            y: rowIndex * Boundary.height
                        },
                        image: createImage('./assets/capRight.png')
                    })
                )
                break
            case '_':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: symbolIndex * Boundary.width,
                            y: rowIndex * Boundary.height
                        },
                        image: createImage('./assets/capBottom.png')
                    })
                )
                break
            case '^':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: symbolIndex * Boundary.width,
                            y: rowIndex * Boundary.height
                        },
                        image: createImage('./assets/capTop.png')
                    })
                )
                break
            case '+':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: symbolIndex * Boundary.width,
                            y: rowIndex * Boundary.height
                        },
                        image: createImage('./assets/pipeCross.png')
                    })
                )
                break
            case '5':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: symbolIndex * Boundary.width,
                            y: rowIndex * Boundary.height
                        },
                        color: 'blue',
                        image: createImage('./assets/pipeConnectorTop.png')
                    })
                )
                break
            case '6':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: symbolIndex * Boundary.width,
                            y: rowIndex * Boundary.height
                        },
                        color: 'blue',
                        image: createImage('./assets/pipeConnectorRight.png')
                    })
                )
                break
            case '7':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: symbolIndex * Boundary.width,
                            y: rowIndex * Boundary.height
                        },
                        color: 'blue',
                        image: createImage('./assets/pipeConnectorBottom.png')
                    })
                )
                break
            case '8':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: symbolIndex * Boundary.width,
                            y: rowIndex * Boundary.height
                        },
                        image: createImage('./assets/pipeConnectorLeft.png')
                    })
                )
                break
            case '.':
                pellets.push(
                    new Pellet({
                        position: {
                            x: symbolIndex * Boundary.width + Boundary.width / 2,
                            y: rowIndex * Boundary.height + Boundary.height / 2
                        }
                    })
                )
                break
            case 'p':
                powerUps.push(
                    new PowerUp({
                        position: {
                            x: symbolIndex * Boundary.width + Boundary.width / 2,
                            y: rowIndex * Boundary.height + Boundary.height / 2
                        }
                    })
                )
                break
        }
    });
});

function circleCollidesWithRectangle({ circle, rectangle }) {
    const padding = Boundary.width / 2 - circle.radius - 1;

    return (
        circle.position.y - circle.radius + circle.velocity.y <= rectangle.position.y + rectangle.height + padding
        && circle.position.y + circle.radius + circle.velocity.y >= rectangle.position.y - padding
        && circle.position.x - circle.radius + circle.velocity.x <= rectangle.position.x + rectangle.width + padding
        && circle.position.x + circle.radius + circle.velocity.x >= rectangle.position.x - padding
    );
}

const velo = 5;
let animationId;
function animate() {
    animationId = requestAnimationFrame(animate);

    context.clearRect(0, 0, canvas.width, canvas.height);

    if (keys.w.pressed && lastKey === 'w') {
        // boundaries.forEach(boundary => {
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i];
            if (circleCollidesWithRectangle({
                circle: { ...pacman, velocity: { x: 0, y: -velo } },
                rectangle: boundary
            })) {
                pacman.velocity.y = 0;
                break;
            }
            else {
                pacman.velocity.y = -velo;
            }
        }
        // });
    }
    else if (keys.s.pressed && lastKey === 's') {
        // boundaries.forEach(boundary => {
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i];
            if (circleCollidesWithRectangle({
                circle: { ...pacman, velocity: { x: 0, y: velo } },
                rectangle: boundary
            })) {
                pacman.velocity.y = 0;
                break;
            }
            else {
                pacman.velocity.y = velo;
            }
        }
        // });
    }
    else if (keys.a.pressed && lastKey === 'a') {
        // boundaries.forEach(boundary => {
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i];
            if (circleCollidesWithRectangle({
                circle: { ...pacman, velocity: { x: -velo, y: 0 } },
                rectangle: boundary
            })) {
                pacman.velocity.x = 0;
                break;
            }
            else {
                pacman.velocity.x = -velo;
            }
        }
        // });
    }
    else if (keys.d.pressed && lastKey === 'd') {
        // boundaries.forEach(boundary => {

        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i];
            if (circleCollidesWithRectangle({
                circle: { ...pacman, velocity: { x: velo, y: 0 } },
                rectangle: boundary
            })) {
                pacman.velocity.x = 0;
                break;
            }
            else {
                pacman.velocity.x = velo;
            }
        }
        // });
    }
    else {
        // pacman.velocity.x = 0;
        // pacman.velocity.y = 0;
    }

    // Touch pellets 
    // pellets.forEach((pellet, pelletIndex) => {
    for (let i = pellets.length - 1; i >= 0; i--) {
        const pellet = pellets[i];
        if (Math.hypot(pellet.position.x - pacman.position.x, pellet.position.y - pacman.position.y) < pacman.radius + pellet.radius) {
            scores += 100;
            highscore.innerHTML = Math.max(highscore.innerHTML, scores);
            score.innerHTML = scores;

            // setTimeout(() => {
            // pellets.splice(pelletIndex, 1);
            // }, 0);
            pellets.splice(i, 1);

        }
        else {
            pellet.draw();
        }
    }
    // })

    // Win condition
    if (pellets.length == 0) {
        scores += 100;
        highscore.innerHTML = Math.max(highscore.innerHTML, scores);
        score.innerHTML = scores;

        setTimeout(() => {
            cancelAnimationFrame(animationId);
            displayTextElem.style.display = 'flex';
            console.log(`You Won!!! \nScore: ${scores}`);
            return;
        }, 20);
    }

    // Player & scared ghost
    for (let i = ghosts.length - 1; i >= 0; i--) {
        const ghost = ghosts[i];
        if (Math.hypot(ghost.position.x - pacman.position.x, ghost.position.y - pacman.position.y) < pacman.radius + ghost.radius) {
            if (ghost.scared) {
                scores += 300;
                score.innerHTML = scores;
                highscore.innerHTML = Math.max(highscore.innerHTML, scores);


                ghosts.splice(i, 1);
            }
        }

    }

    // Player & powerups
    for (let i = powerUps.length - 1; i >= 0; i--) {
        const powerUp = powerUps[i];
        if (Math.hypot(powerUp.position.x - pacman.position.x, powerUp.position.y - pacman.position.y) < pacman.radius + powerUp.radius) {
            scores += 200;
            score.innerHTML = scores;
            highscore.innerHTML = Math.max(highscore.innerHTML, scores);

            powerUps.splice(i, 1);
            ghosts.forEach(ghost => {
                ghost.scared = true;

                setTimeout(() => {
                    ghost.scared = false;
                }, 5000);
            });
        }
        else {
            powerUp.draw();
        }
    }

    boundaries.forEach(boundary => {
        boundary.draw();


        if (circleCollidesWithRectangle({ circle: pacman, rectangle: boundary })) {
            pacman.velocity.x = 0;
            pacman.velocity.y = 0;
        }
    });

    pacman.update();
    // pacman.velocity.x = 0;
    // pacman.velocity.y = 0;

    ghosts.forEach((ghost, ghostIndex) => {
        ghost.update();

        if (Math.hypot(ghost.position.x - pacman.position.x, ghost.position.y - pacman.position.y) < pacman.radius + ghost.radius) {
            // scores -= 100;
            score.innerHTML = scores;
            highscore.innerHTML = Math.max(highscore.innerHTML, scores);

            if (!ghost.scared) {
                setTimeout(() => {
                    cancelAnimationFrame(animationId);
                    displayTextElem.style.display = 'flex';
                    console.log(`You Loose!!! \nScore: ${scores}`)
                    return;
                }, 20);
            }
            // else{
            //     scores += 300;
            //     score.innerHTML = scores;

            //     setTimeout(() => {
            //         ghosts.splice(ghostIndex, 1);
            //     }, 0);
            // }
        }

        const collusions = [];
        boundaries.forEach((boundary, boundaryIndex) => {
            if (
                !collusions.includes('right') &&
                circleCollidesWithRectangle({
                    circle: { ...ghost, velocity: { x: ghost.speed, y: 0 } },
                    rectangle: boundary
                })) {
                collusions.push('right');
            }
            if (
                !collusions.includes('left') &&
                circleCollidesWithRectangle({
                    circle: { ...ghost, velocity: { x: -ghost.speed, y: 0 } },
                    rectangle: boundary
                })) {
                collusions.push('left');
            }
            if (
                !collusions.includes('down') &&
                circleCollidesWithRectangle({
                    circle: { ...ghost, velocity: { x: 0, y: ghost.speed } },
                    rectangle: boundary
                })) {
                collusions.push('down');
            }
            if (
                !collusions.includes('up') &&
                circleCollidesWithRectangle({
                    circle: { ...ghost, velocity: { x: 0, y: -ghost.speed } },
                    rectangle: boundary
                })) {
                collusions.push('up');
            }
        });

        if (collusions.length > ghost.prevCollusion.length) {
            ghost.prevCollusion = collusions;
        }

        if (JSON.stringify(collusions) !== JSON.stringify(ghost.prevCollusion)) {

            // console.log(collusions);
            // console.log(ghost.prevCollusion);
            if (ghost.velocity.x > 0) {
                ghost.prevCollusion.push('right');
            }
            else if (ghost.velocity.x < 0) {
                ghost.prevCollusion.push('left');
            }
            else if (ghost.velocity.y < 0) {
                ghost.prevCollusion.push('up');
            }
            else if (ghost.velocity.y > 0) {
                ghost.prevCollusion.push('down');
            }

            const pathways = ghost.prevCollusion.filter((collusion) => {
                return !collusions.includes(collusion);
            })

            const direction = pathways[Math.floor(Math.random() * (pathways.length))];

            switch (direction) {
                case 'down':
                    ghost.velocity.y = ghost.speed;
                    ghost.velocity.x = 0;
                    break;

                case 'up':
                    ghost.velocity.y = -ghost.speed;
                    ghost.velocity.x = 0;
                    break;

                case 'right':
                    ghost.velocity.y = 0;
                    ghost.velocity.x = ghost.speed;
                    break;

                case 'left':
                    ghost.velocity.y = 0;
                    ghost.velocity.x = -ghost.speed;
                    break;

                default:
                    break;
            }

            ghost.prevCollusion = [];
        }

        // console.log(collusions);
    })

    if (pacman.velocity.x > 0) {
        pacman.rotation = 0;
    }
    else if (pacman.velocity.x < 0) {
        pacman.rotation = Math.PI;
    }
    else if (pacman.velocity.y > 0) {
        pacman.rotation = Math.PI / 2;
    }
    else if (pacman.velocity.y < 0) {
        pacman.rotation = Math.PI * 1.5;
    }
}

addEventListener('keydown', ({ key }) => {
    switch (key) {
        case 'w':
            console.log('up');
            keys.w.pressed = true;
            lastKey = 'w';
            // pacman.velocity.y = -5;
            break;

        case 's':
            console.log('down');
            keys.s.pressed = true;
            lastKey = 's';
            // pacman.velocity.y = 5;
            break;

        case 'a':
            console.log('left');
            keys.a.pressed = true;
            lastKey = 'a';
            // pacman.velocity.x = -5;
            break;

        case 'd':
            console.log('right');
            keys.d.pressed = true;
            lastKey = 'd';
            // pacman.velocity.x = 5;
            break;

        default:
            break;
    }
});

addEventListener('keyup', ({ key }) => {
    switch (key) {
        case 'w':
            console.log('up');
            keys.w.pressed = false;
            // pacman.velocity.y = 0;
            break;

        case 's':
            console.log('down');
            keys.s.pressed = false;
            // pacman.velocity.y = 0;
            break;

        case 'a':
            console.log('left');
            keys.a.pressed = false;
            // pacman.velocity.x = 0;
            break;

        case 'd':
            console.log('right');
            keys.d.pressed = false;
            // pacman.velocity.x = 0;
            break;

        default:
            break;
    }
});

startGameButton.addEventListener('click', (event) => {
    init();
    animate();
    displayScores.style.display = 'flex';
    startGameButton.innerHTML = "Restart";
    displayTextElem.style.display = 'none';
});
