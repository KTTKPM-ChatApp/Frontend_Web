import {
    MenuList,
    MenuItem,
    Divider,
    Paper,
    styled,
    Typography,
    Checkbox,
    Box
} from "@mui/material";
import LabelIcon from "@mui/icons-material/Label";
import { FilterCategoryKey } from "../page";
import { categoryColors, categories } from "../../../constant";

interface Props {
    selected: FilterCategoryKey[];
    onChange: (value: FilterCategoryKey[]) => void;
}
export const DropdownMenu = styled(Paper)(() => ({
    position: "absolute",
    top: 32,
    left: 0,
    minWidth: 220,
    borderRadius: 8,
    padding: "0px 8px",
    border: "1px solid #E5E7EB",
    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
    zIndex: 1000,
}));

const FilterCategogyTitle = styled(Typography)(() => ({
    fontSize: 14,
    color: "#212121",
}));

const StyledCheckbox = styled(Checkbox)(() => ({
    padding: 2,      
    width: 20,
    height: 20,

    "& .MuiSvgIcon-root": {
        fontSize: 20,    
    },

    "&:hover": {
        backgroundColor: "transparent",
    },
}));
export const StyledMenuItem = styled(MenuItem, {
    shouldForwardProp: (prop) => prop !== "ischecked",
})<{
    ischecked?: boolean;
}>(({ ischecked }) => ({
    display: "flex",
    alignItems: "center",
    gap: 12,
    borderRadius: 8,
    margin: "4px 8px",
    backgroundColor: ischecked ? "#E5F1FF" : "transparent",
    "&:hover": {
        backgroundColor: ischecked ? "#E5F1FF" : "#F3F4F6",
    },
}));
const FilterCategoryDropdown = ({ selected, onChange }: Props) => {
    const handleToggle = (key: FilterCategoryKey) => {
        if (selected.includes(key)) {
            onChange(selected.filter((item) => item !== key));
        } else {
            onChange([...selected, key]);
        }
    };
    return (
        <DropdownMenu>
            <MenuList dense>
                <FilterCategogyTitle>
                    Theo thẻ phân loại
                </FilterCategogyTitle>

                {categories.map((item) => (
                    <StyledMenuItem
                        key={item}
                        ischecked={selected.includes(item)}
                        onClick={() => handleToggle(item)}
                    >
                        <StyledCheckbox
                            checked={selected.includes(item)}
                            disableRipple
                            onClick={(e) => e.stopPropagation()}
                        />

                        <LabelIcon
                            fontSize="small"
                            sx={{
                                color: categoryColors[item],
                            }}
                        />
                        <Typography fontSize={13}>
                            {item}
                        </Typography>
                    </StyledMenuItem>
                ))}
            </MenuList>
        </DropdownMenu>
    );
};

export default FilterCategoryDropdown;