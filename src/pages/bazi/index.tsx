
import React from 'react';
import  UserInput  from './components/UserInput';
import  FourPillars  from './components/FourPillars';
import  CoreEnergy  from './components/CoreEnergy';
import  EnergyFlow  from './components/EnergyFlow';
import  AuxStars  from './components/AuxStars';
import  RelationModel  from './components/RelationModel';
import  LuckTrack  from './components/LuckTrack';
import  Explore  from './components/Explore';
import ContactAuthor from './components/ContactAuthor';
import './index.scss';

const BaZiPage: React.FC = () => {
  return (
    <div className="bazi-page-modules">
      <UserInput />
      <FourPillars />
      <CoreEnergy />
      <EnergyFlow />
      <AuxStars />
      <RelationModel />
      <LuckTrack />
      <Explore />
      <ContactAuthor />
    </div>
  );
};

export default BaZiPage;
