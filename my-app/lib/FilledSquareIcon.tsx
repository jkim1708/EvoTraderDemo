import { DotFilledIcon } from "@radix-ui/react-icons";

function FilledSquareIcon({ size = 16, color = "black" }) {
    return (
        <div
            style={{
                width: size,
                height: size,
                backgroundColor: color,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 0, // Ensures it's a square
            }}
        >
            <DotFilledIcon color={color} />
        </div>
    );
}

export default FilledSquareIcon;