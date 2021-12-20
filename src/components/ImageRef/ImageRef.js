import React from "react"
import { useState, useRef, useEffect } from "react";
import Konva from "konva";
import { v4 as uuidv4 } from "uuid"
import "./image.scss"
import { Layer, Rect, Stage } from "react-konva";

function ImageRef() {
    const fileInputRef = useRef(null);
    const [image, setImage] = useState(null);
    const [imageName, setImageName] = useState(null);
    const [preview, setPreview] = useState(null);

    const [annotations, setAnnotations] = useState([]);
    const [newAnnotation, setNewAnnotation] = useState([]);

    useEffect(() => {
        if (image) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            }
            reader.readAsDataURL(image);
        } else {
            setPreview(null);
        }
    }, [image])

    const exportDownload = ({ coordinateData, fileType, fileName }) => {
        const blob = new Blob([coordinateData], { type: fileType });
        
        const a = document.createElement('a'); // a (anchor tag element)
        a.download = fileName;
        a.href = window.URL.createObjectURL(blob);

        const onClickEvent = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true,
        })

        a.dispatchEvent(onClickEvent);
        a.remove()
    }

    const exportToJsonFile = (event) => {
        event.preventDefault();
        if(image) {
            exportDownload({
                coordinateData: JSON.stringify({annotations}, null, "\t"),
                fileName: "coordinates.json",
                fileType: "text/json"
            })
        } else {
            alert("No image uploaded");
        }
        
    }

    const handleMouseDown = (event) => {
        if (newAnnotation.length === 0) {
            const { x, y } = event.target.getStage().getPointerPosition();
            setNewAnnotation([{ x, y, width: 0, height: 0, key: "0" }]);
        }
    };

    const handleMouseUp = (event) => {
        if (newAnnotation.length === 1) {
            const sx = newAnnotation[0].x;
            const sy = newAnnotation[0].y;
            const { x, y } = event.target.getStage().getPointerPosition();
            const annotationToAdd = {
                x: sx,
                y: sy,
                width: x - sx,
                height: y - sy,
                key: annotations.length + 1
            };
            annotations.push(annotationToAdd);
            setNewAnnotation([]);
            setAnnotations(annotations);
        }
    };

    const handleMouseMove = (event) => {
        if (newAnnotation.length === 1) {
            const sx = newAnnotation[0].x;
            const sy = newAnnotation[0].y;
            const { x, y } = event.target.getStage().getPointerPosition();
            setNewAnnotation([{
                x: sx,
                y: sy,
                width: x - sx,
                height: y - sy,
                key: "0"
            }]);
        }
    };

    const annotationsToDraw = [...annotations, ...newAnnotation];

    return (
        <div className="container">
            <h1>Assignment 2</h1>
            <form>
                <button onClick={(event) => {
                    event.preventDefault();
                    fileInputRef.current.click()
                }}>Upload Image</button>

                <input
                    type="file"
                    style={{ display: "none" }}
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={(event) => {
                        const file = event.target.files[0];
                        const fileName = event.target.value.replace(/.*[\/\\]/, '');;
                        console.log(fileName);
                        if (file && file.type.substring(0, 5) === "image") {
                            setImage(file);
                            setImageName(fileName)
                        } else {
                            setImage(null);
                        }
                    }} />
            </form>

             {!image ? <h2>No Images Uploaded</h2> : <Stage
                width={500}
                height={500}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                style={{ backgroundImage: `url(${preview})`, backgroundRepeat: "no-repeat", maxHeight: "500px", maxWidth: "600px", objectFit: "cover" }}
            >
                <Layer>
                    {annotationsToDraw.map((value) => {
                        return (
                            <Rect 
                                key={uuidv4()}
                                x={value.x}
                                y={value.y}
                                width={value.width}
                                height={value.height}
                                stroke={Konva.Util.getRandomColor()}
                            />
                        )
                    })}
                </Layer>
            </Stage>
            }
            <button onClick={(event) => exportToJsonFile(event)}>Export Coordinates</button>
        </div>
    );
}

export default ImageRef;