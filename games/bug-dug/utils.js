function getGridIndex(position, blockSize) {
    return { x: Math.floor(position.x / blockSize), y: Math.floor(position.y / blockSize) };
}

function calculateAABBCollision(obj1, obj2) {
    const collider1 = obj1.collider;
    const collider2 = obj2.collider;
    let collision = {
        obj1: {
            top: false,
            bottom: false,
            left: false,
            right: false,
        },
        obj2: {
            top: false,
            bottom: false,
            left: false,
            right: false,
        },
    };
    if (
        collider1.a.x < collider2.b.x &&
        collider1.b.x > collider2.a.x &&
        collider1.a.y < collider2.d.y &&
        collider1.d.y > collider2.a.y
    ) {
        if (collider1.a.x > collider2.a.x && collider1.b.x > collider2.b.x) {
            collision.obj1.left = true;
            collision.obj2.right = true;
        }
        if (collider1.a.x < collider2.a.x && collider1.b.x < collider2.b.x) {
            collision.obj1.right = true;
            collision.obj2.left = true;
        }
        if (collider1.a.y > collider2.a.y && collider1.d.y > collider2.d.y) {
            collision.obj1.top = true;
            collision.obj2.bottom = true;
        }
        if (collider1.a.y < collider2.a.y && collider1.d.y < collider2.d.y) {
            collision.obj1.bottom = true;
            collision.obj2.top = true;
        }
        return collision;
    }
    return null;
}
