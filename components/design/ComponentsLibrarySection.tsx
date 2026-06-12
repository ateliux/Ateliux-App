import { designContent } from "../../content/design";
import {
  AppointmentCard,
  BottomNavMock,
  ButtonsCard,
  CalendarCard,
  CartCard,
  DistanceSliderCard,
  IntegrationCard,
  MessagePreviewCard,
  ProductMiniCard,
  ProjectCard,
  RatingCard,
  SearchInputMock,
  SegmentControlCard,
  SystemControlCard,
  VerticalScaleCard,
} from "./DesignPreviewCards";
import { MotionContainer, MotionItem } from "../motion";

export function ComponentsLibrarySection() {
  return (
    <section>
      <h2 className="mb-4 text-xl font-bold text-slate-900">
        {designContent.components.title}
      </h2>

      <p className="mb-12 max-w-2xl text-sm leading-relaxed text-slate-500">
        {designContent.components.description}
      </p>

      <MotionContainer className="flex flex-col gap-8 lg:flex-row">
        <MotionItem staggered className="flex flex-1 flex-col gap-6">
          <ButtonsCard />
          <BottomNavMock />
          <DistanceSliderCard />
          <SearchInputMock />
          <SegmentControlCard />
          <ProjectCard />
        </MotionItem>

        <MotionItem staggered className="flex flex-1 flex-col gap-6">
          <AppointmentCard />
          <div className="grid grid-cols-2 gap-4">
            <ProductMiniCard />
            <MessagePreviewCard />
          </div>
          <CartCard />
        </MotionItem>

        <MotionItem staggered className="flex flex-1 flex-col gap-6">
          <SystemControlCard />
          <CalendarCard />
          <div className="grid grid-cols-[1fr_76px] gap-4">
            <RatingCard />
            <VerticalScaleCard />
          </div>
          <IntegrationCard />
        </MotionItem>
      </MotionContainer>
    </section>
  );
}
