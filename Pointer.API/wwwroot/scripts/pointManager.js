class PointManager {
    constructor(containerSelector, api) {
        this.api = api;
        this.stage = new Konva.Stage({
            container: containerSelector.slice(1),
            width: 1000,
            height: 600
        });

        this.commentsLayer = new Konva.Layer();
        this.pointsLayer = new Konva.Layer();

        this.stage.add(this.commentsLayer);
        this.stage.add(this.pointsLayer);

        this.commentGroups = {};
    }

    async init() {
        const points = await this.api.getPoints();

        this.commentsLayer.destroyChildren();
        this.pointsLayer.destroyChildren();

        points.forEach(p => {
            this.drawComments(p);
        });

        points.forEach(p => this.drawPoint(p));

        this.pointsLayer.batchDraw();
        this.commentsLayer.batchDraw();
    }

    async showAddPointDialog() {
        const { value: formValues } = await Swal.fire({
            title: 'Создать новую точку',
            html: `
            <div style="display: grid; grid-template-columns: 80px 1fr; align-items: center; gap: 10px;">
                <label for="swal-point-x" style="text-align: right;">X:</label>
                <input id="swal-point-x" type="number" class="swal2-input" required>

                <label for="swal-point-y" style="text-align: right;">Y:</label>
                <input id="swal-point-y" type="number" class="swal2-input" required>

                <label for="swal-point-radius" style="text-align: right;">Радиус:</label>
                <input id="swal-point-radius" type="number" class="swal2-input" value="10" required>

                <div style="grid-column: 1 / -1; text-align: center; margin-top: 5px;">
                    <label for="swal-point-color" style="margin-right: 10px;">Цвет:</label>
                    <input id="swal-point-color" type="color" value="#ffffff" style="width: 50px; height: 30px;">
                </div>
            </div>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Создать',
            cancelButtonText: 'Отмена',
            preConfirm: () => {
                return {
                    x: Number(document.getElementById('swal-point-x').value),
                    y: Number(document.getElementById('swal-point-y').value),
                    radius: Number(document.getElementById('swal-point-radius').value),
                    color: document.getElementById('swal-point-color').value
                };
            },
            inputValidator: (result) => {
                if (!result || isNaN(result.x) || isNaN(result.y) || isNaN(result.radius)) {
                    return 'Пожалуйста, введите корректные значения!';
                }
                if (result.radius <= 0) {
                    return 'Радиус должен быть положительным числом!';
                }
            }
        });

        if (formValues) {
            try {
                const newPoint = {
                    ...formValues,
                    comments: []
                };

                await this.api.addPoint(newPoint);
                this.init(); // Обновляем отображение

                Swal.fire({
                    icon: 'success',
                    title: 'Точка создана!',
                    timer: 1500,
                    showConfirmButton: false
                });
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Ошибка',
                    text: 'Не удалось создать точку'
                });
                console.error('Ошибка при создании точки:', error);
            }
        }
    }

    drawPoint(p) {
        const circle = new Konva.Circle({
            x: p.x,
            y: p.y,
            radius: p.radius,
            fill: p.color,
            draggable: true,
            shadowColor: 'black',
            shadowBlur: 10,
            shadowOpacity: 0.3,
            stroke: 'black',
            strokeWidth: 0.5
        });

        circle.on("dblclick", async () => {
            await this.api.deletePoint(p.id);
            this.init();
        });
        circle.on("dragmove", () => {
            this.updateCommentPosition(p, circle.x(), circle.y());
        });

        circle.on("dragend", async () => {
            const updated = { ...p, x: circle.x(), y: circle.y() };
            await this.api.updatePoint(updated);
        });

        this.pointsLayer.add(circle);
        this.pointsLayer.batchDraw();
    }

    drawComments(point) {
        // Удаляем предыдущую группу комментариев, если она существует
        if (this.commentGroups[point.id]) {
            this.commentGroups[point.id].destroy();
        }

        // Создаем новую группу для комментариев
        const group = new Konva.Group({
            x: point.x,
            y: point.y + point.radius + 15, // Отступ от точки
            listening: true
        });

        // Инициализируем массив комментариев, если его нет
        point.comments = point.comments || [];

        // Параметры стиля
        const commentPadding = 10;
        const commentSpacing = 5;
        const buttonHeight = 25;
        const minCommentWidth = 100;
        const maxCommentWidth = 300;
        const textPadding = 10;

        // Переменная для отслеживания текущей позиции Y
        let currentY = 0;

        // Отрисовываем каждый комментарий
        point.comments.forEach((comment) => {
            // Создаем временный текст для измерения
            const tempTextWidth = new Konva.Text({
                text: comment.text,
                fontSize: 12,
            });
            const textSizeWidth = tempTextWidth.getSelfRect().width;
            tempTextWidth.destroy();

            const tempTextHeight = new Konva.Text({
                text: comment.text,
                fontSize: 12,
                width: maxCommentWidth 
            });
            const textSizeHeight = tempTextHeight.getSelfRect().height;
            tempTextHeight.destroy();

            // Рассчитываем размеры блока комментария
            const textWidth = Math.min(
                Math.max(textSizeWidth, minCommentWidth - textPadding),
                maxCommentWidth - textPadding
            );
            
            const requiredWidth = textWidth + textPadding;
            const requiredHeight = Math.max(textSizeHeight + 2 * textPadding, 30);
            

            // Создаем группу для комментария
            const commentGroup = new Konva.Group({
                y: currentY,
                listening: true
            });

            // Центрируем комментарий относительно точки
            commentGroup.offsetX(requiredWidth / 2);

            // Фон комментария
            const commentBg = new Konva.Rect({
                width: requiredWidth,
                height: requiredHeight,
                fill: comment.backgroundColor || 'rgba(240, 240, 240, 0.7)',
                cornerRadius: 5,
                listening: true
            });
            commentGroup.add(commentBg);

            // Текст комментария
            const text = new Konva.Text({
                x: textPadding,
                y: textPadding,
                width: textWidth,
                text: comment.text,
                fontSize: 12,
                fill: '#333',
                align: 'left',
                wrap: 'word',
                ellipsis: true
            });
            commentGroup.add(text);

            // Обработчик двойного клика для редактирования
            commentGroup.on('dblclick', () => {
                this.editComment(comment, text);
            });

            group.add(commentGroup);
            currentY += requiredHeight + commentSpacing;
        });

        // Добавляем кнопку "Добавить комментарий"
        const addButton = new Konva.Group({
            y: currentY,
            listening: true
        });

        const buttonWidth = 30;
        const buttonBg = new Konva.Rect({
            width: buttonWidth,
            height: buttonHeight,
            fill: '#4CAF50',
            cornerRadius: 5
        });

        const buttonText = new Konva.Text({
            text: '+',
            fontSize: 12,
            fill: 'white',
            width: buttonWidth,
            align: 'center',
            y: (buttonHeight - 12) / 2 // Центрируем текст по вертикали
        });

        // Центрируем кнопку относительно точки
        addButton.offsetX(buttonWidth / 2);

        addButton.add(buttonBg);
        addButton.add(buttonText);

        // Обработчик клика по кнопке
        addButton.on('click', () => {
            this.addNewComment(point.id);
        });

        group.add(addButton);

        // Добавляем группу на слой и сохраняем ссылку
        this.commentsLayer.add(group);
        this.commentGroups[point.id] = group;
        this.commentsLayer.draw();
    }

    updateCommentPosition(point, x, y) {
        const group = this.commentGroups[point.id];

        if (!group) return;

        const newX = x ;
        const newY = y + point.radius + 15;

        group.position({
            x: newX,
            y: newY,
        });

        this.commentsLayer.batchDraw();
    }

    truncateComment(text, maxLength = 70) {
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    async addNewComment(pointId) {
        const { value: formValues } = await Swal.fire({
            title: 'Добавить комментарий',
            html: `
                    <input
                        id="swal-comment-text"
                        class="swal2-input"
                        placeholder="Текст комментария"
                        autofocus
                    >
                    <div style="margin: 10px 0; display: flex; align-items: center; justify-content: center; gap: 10px;">
                        <label for="swal-comment-color" style="flex-shrink: 0;">Цвет фона:</label>
                        <input
                            id="swal-comment-color"
                            type="color"
                            value="#f0f0f0"
                            style="width: 50px; height: 30px;"
                        >
                    </div>
        `,
            focusConfirm: false,
            showCancelButton: true,
            preConfirm: () => {
                return {
                    text: document.getElementById('swal-comment-text').value,
                    color: document.getElementById('swal-comment-color').value
                };
            },
            inputValidator: (result) => {
                if (!result || !result.text) {
                    return 'Нужно ввести текст комментария!';
                }
            }
        });

        if (!formValues) return;

        const comment = {
            text: formValues.text,
            backgroundColor: formValues.color
        };

        try {
            await this.api.addComment(pointId, comment);
            this.init();
            Swal.fire({
                icon: 'success',
                title: 'Комментарий добавлен!',
                timer: 1500,
                showConfirmButton: false
            });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Ошибка',
                text: 'Не удалось добавить комментарий'
            });
            console.error('Ошибка:', error);
        }
    }

    async editComment(comment, textNode) {
        const { value: formValues} = await Swal.fire({
            title: 'Редактировать комментарий',
            html: `
            <input 
                id="swal-comment-text" 
                class="swal2-input" 
                placeholder="Текст комментария"
                value="${comment.text.replace(/"/g, '&quot;')}"
                autofocus>
            <div style="margin: 10px 0; display: flex; align-items: center; justify-content: center; gap: 10px;">
                        <label for="swal-comment-color" style="flex-shrink: 0;">Цвет фона:</label>
                        <input
                            id="swal-comment-color"
                            type="color"
                            value="${comment.backgroundColor || '#f0f0f0'}"
                            style="width: 50px; height: 30px;">
            </div>
        `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Сохранить',
            cancelButtonText: 'Отмена',
            showDenyButton: true,
            denyButtonText: 'Удалить',
            denyButtonColor: '#ff4444',
            preConfirm: () => {
                return {
                    text: document.getElementById('swal-comment-text').value,
                    color: document.getElementById('swal-comment-color').value,
                    action: 'save'
                };
            },
            preDeny: () => {
                return { action: 'delete' };
            },
            inputValidator: (result) => {
                if (result && result.action === 'save' && !result.text) {
                    return 'Текст комментария не может быть пустым!';
                }
            }
        });

        if (formValues?.action === 'delete') {
            try {
                await this.api.deleteComment(comment.id);
                this.init();

                Swal.fire({
                    icon: 'success',
                    title: 'Комментарий удалён!',
                    timer: 1500,
                    showConfirmButton: false
                });
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Ошибка',
                    text: 'Не удалось удалить комментарий'
                });
                console.error('Ошибка при удалении комментария:', error);
            }
            return;
        }

        if (formValues) {
            try {
                const updatedComment = {
                    ...comment,
                    text: formValues.text,
                    backgroundColor: formValues.color
                };

                await this.api.updateComment(updatedComment);

                textNode.text(this.truncateComment(formValues.text));
                if (textNode.parent && textNode.parent.findOne('Rect')) {
                    textNode.parent.findOne('Rect').fill(formValues.color);
                }
                this.commentsLayer.draw();

                Swal.fire({
                    icon: 'success',
                    title: 'Комментарий обновлён!',
                    timer: 1500,
                    showConfirmButton: false
                });
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Ошибка',
                    text: 'Не удалось обновить комментарий'
                });
                console.error('Ошибка при обновлении комментария:', error);
            }
        }
    }

    async addRandomPoint() {
        const point = {
            x: Math.random() * 800 + 50,
            y: Math.random() * 500 + 50,
            radius: 30,
            color: this.randomColor(),
            comments: []
        };
        await this.api.addPoint(point);
        this.init();
    }

    randomColor() {
        return getRandomColor();
    }
}
