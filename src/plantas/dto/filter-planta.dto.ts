import { PartialType } from "@nestjs/mapped-types";
import { CreatePlantaDto } from "./create-planta.dto";

export class FilterPlantaDto extends PartialType((CreatePlantaDto)) {}