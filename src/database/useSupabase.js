import { supabase } from './supabase.js';

// ========================================
// FAMILY MEMBERS API FUNCTIONS
// ========================================

/**
 * Get all family members
 */
export const getFamilyMembers = async () => {
  try {
    const { data, error } = await supabase
      .from('family_members')
      .select('*')
      .order('birth_year', { ascending: true });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching family members:', error);
    return { data: null, error };
  }
};

/**
 * Get a single family member by ID
 */
export const getFamilyMember = async (id) => {
  try {
    const { data, error } = await supabase
      .from('family_members')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching family member:', error);
    return { data: null, error };
  }
};

/**
 * Create a new family member
 */
export const createFamilyMember = async (memberData) => {
  try {
    const { data, error } = await supabase
      .from('family_members')
      .insert([memberData])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating family member:', error);
    return { data: null, error };
  }
};

/**
 * Update a family member
 */
export const updateFamilyMember = async (id, updates) => {
  try {
    const { data, error } = await supabase
      .from('family_members')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating family member:', error);
    return { data: null, error };
  }
};

/**
 * Delete a family member
 */
export const deleteFamilyMember = async (id) => {
  try {
    const { error } = await supabase
      .from('family_members')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error deleting family member:', error);
    return { error };
  }
};

// ========================================
// FAMILY RELATIONSHIPS API FUNCTIONS
// ========================================

/**
 * Get all family relationships
 */
export const getFamilyRelationships = async () => {
  try {
    const { data, error } = await supabase
      .from('family_relationships')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching family relationships:', error);
    return { data: null, error };
  }
};

/**
 * Get relationships for a specific person
 */
export const getPersonRelationships = async (personId) => {
  try {
    const { data, error } = await supabase
      .from('family_relationships')
      .select('*')
      .or(`person1_id.eq.${personId},person2_id.eq.${personId}`)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching person relationships:', error);
    return { data: null, error };
  }
};

/**
 * Create a new family relationship
 */
export const createFamilyRelationship = async (relationshipData) => {
  try {
    const { data, error } = await supabase
      .from('family_relationships')
      .insert([relationshipData])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating family relationship:', error);
    return { data: null, error };
  }
};

/**
 * Update a family relationship
 */
export const updateFamilyRelationship = async (id, updates) => {
  try {
    const { data, error } = await supabase
      .from('family_relationships')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating family relationship:', error);
    return { data: null, error };
  }
};

/**
 * Delete a family relationship
 */
export const deleteFamilyRelationship = async (id) => {
  try {
    const { error } = await supabase
      .from('family_relationships')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error deleting family relationship:', error);
    return { error };
  }
};

// ========================================
// RELATIONSHIP MANAGEMENT FUNCTIONS
// ========================================

/**
 * Add parent-child relationship
 */
export const addParentChildRelationship = async (parentId, childId, relationshipSubtype) => {
  try {
    const relationshipData = {
      person1_id: parentId,
      person2_id: childId,
      relationship_type: 'parent_child',
      relationship_subtype: relationshipSubtype,
      is_current: true
    };

    const { data, error } = await createFamilyRelationship(relationshipData);
    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error adding parent-child relationship:', error);
    return { data: null, error };
  }
};

/**
 * Add marriage relationship
 */
export const addMarriageRelationship = async (person1Id, person2Id, marriageDate = null) => {
  try {
    const relationshipData = {
      person1_id: person1Id,
      person2_id: person2Id,
      relationship_type: 'spouse',
      relationship_subtype: 'husband_wife',
      marriage_date: marriageDate,
      is_current: true
    };

    const { data, error } = await createFamilyRelationship(relationshipData);
    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error adding marriage relationship:', error);
    return { data: null, error };
  }
};

/**
 * Remove relationship between two family members
 */
export const removeRelationship = async (person1Id, person2Id) => {
  try {
    const { error } = await supabase
      .from('family_relationships')
      .delete()
      .or(`and(person1_id.eq.${person1Id},person2_id.eq.${person2Id}),and(person1_id.eq.${person2Id},person2_id.eq.${person1Id})`);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error removing relationship:', error);
    return { error };
  }
};

/**
 * Get all possible parents for a child
 */
export const getPossibleParents = async (childId, relationships) => {
  try {
    // Get all members except the child and their current parents
    const { data: members, error } = await getFamilyMembers();
    if (error) throw error;

    // Filter out the child and their current parents
    const child = members.find(m => m.id === childId);
    const currentParents = members.filter(m => 
      relationships.some(r => 
        r.relationship_type === 'parent_child' && 
        r.person1_id === m.id && 
        r.person2_id === childId
      )
    );

    const possibleParents = members.filter(member => 
      member.id !== childId && 
      !currentParents.some(p => p.id === member.id) &&
      // Ensure parent is older than child
      member.birth_year < child.birth_year
    );

    return { data: possibleParents, error: null };
  } catch (error) {
    console.error('Error getting possible parents:', error);
    return { data: null, error };
  }
};

/**
 * Get all possible children for a parent
 */
export const getPossibleChildren = async (parentId, relationships) => {
  try {
    const { data: members, error } = await getFamilyMembers();
    if (error) throw error;

    const parent = members.find(m => m.id === parentId);
    const currentChildren = members.filter(m => 
      relationships.some(r => 
        r.relationship_type === 'parent_child' && 
        r.person1_id === parentId && 
        r.person2_id === m.id
      )
    );

    const possibleChildren = members.filter(member => 
      member.id !== parentId && 
      !currentChildren.some(c => c.id === member.id) &&
      // Ensure child is younger than parent
      member.birth_year > parent.birth_year
    );

    return { data: possibleChildren, error: null };
  } catch (error) {
    console.error('Error getting possible children:', error);
    return { data: null, error };
  }
};

// ========================================
// TREE STRUCTURE FUNCTIONS
// ========================================

/**
 * Build family tree structure with proper hierarchy
 */
export const buildFamilyTree = (members, relationships) => {
  const memberMap = new Map();
  const childrenMap = new Map();
  const parentMap = new Map();

  // Initialize maps
  members.forEach(member => {
    memberMap.set(member.id, member);
    childrenMap.set(member.id, []);
    parentMap.set(member.id, []);
  });

  // Build parent-child relationships
  relationships.forEach(rel => {
    if (rel.relationship_type === 'parent_child') {
      const parent = memberMap.get(rel.person1_id);
      const child = memberMap.get(rel.person2_id);
      
      if (parent && child) {
        childrenMap.get(parent.id).push(child.id);
        parentMap.get(child.id).push(parent.id);
      }
    }
  });

  // Build marriage relationships (for positioning spouses together)
  const marriageMap = new Map();
  relationships.forEach(rel => {
    if (rel.relationship_type === 'spouse') {
      const person1 = memberMap.get(rel.person1_id);
      const person2 = memberMap.get(rel.person2_id);
      
      if (person1 && person2) {
        marriageMap.set(person1.id, person2.id);
        marriageMap.set(person2.id, person1.id);
      }
    }
  });

  // Find root members (those with no parents)
  const rootMembers = members.filter(member => parentMap.get(member.id).length === 0);

  // Build generations
  const generations = [];
  const processed = new Set();

  // Start with root members
  let currentGeneration = rootMembers.map(member => ({
    ...member,
    level: 0,
    position: { x: 0, y: 0 }
  }));

  while (currentGeneration.length > 0) {
    generations.push([...currentGeneration]);
    
    const nextGeneration = [];
    currentGeneration.forEach(member => {
      processed.add(member.id);
      
      // Get children
      const children = childrenMap.get(member.id)
        .map(childId => memberMap.get(childId))
        .filter(child => child && !processed.has(child.id));
      
      children.forEach(child => {
        nextGeneration.push({
          ...child,
          level: member.level + 1,
          position: { x: 0, y: 0 }
        });
        processed.add(child.id);
      });
    });
    
    currentGeneration = nextGeneration;
  }

  return {
    members: members.map(member => ({
      ...member,
      level: generations.findIndex(gen => gen.some(m => m.id === member.id)),
      children: childrenMap.get(member.id),
      parents: parentMap.get(member.id),
      spouse: marriageMap.get(member.id)
    })),
    generations,
    relationships,
    marriageMap
  };
};

/**
 * Calculate node positions for family tree layout (VERTICAL - Organizational Chart Style)
 */
export const calculateNodePositions = (treeStructure) => {
  const { generations, marriageMap } = treeStructure;
  const positionedMembers = [];
  const processed = new Set();

  generations.forEach((generation, genIndex) => {
    const yPosition = 120 + (genIndex * 280); // 280px between generations (Y-axis - top to bottom)
    
    // Group married couples together
    const couples = [];
    const singles = [];
    
    generation.forEach(member => {
      if (processed.has(member.id)) return;
      
      const spouseId = marriageMap.get(member.id);
      
      if (spouseId && generation.some(m => m.id === spouseId)) {
        const spouse = generation.find(m => m.id === spouseId);
        if (spouse && !processed.has(spouse.id)) {
          couples.push([member, spouse]);
          processed.add(member.id);
          processed.add(spouse.id);
        } else {
          singles.push(member);
          processed.add(member.id);
        }
      } else {
        singles.push(member);
        processed.add(member.id);
      }
    });

    // Calculate positions
    const allGroups = [...couples, ...singles];
    const totalGroups = allGroups.length;
    const spacing = 300; // Space between groups horizontally
    
    allGroups.forEach((group, groupIndex) => {
      if (Array.isArray(group)) {
        // Married couple - position side by side
        const coupleSpacing = 150; // Space between spouses
        const groupCenterX = 400 + (groupIndex - (totalGroups - 1) / 2) * spacing;
        
        group.forEach((member, memberIndex) => {
          const xPosition = groupCenterX + (memberIndex - 0.5) * coupleSpacing;
          positionedMembers.push({
            ...member,
            position: { x: xPosition, y: yPosition }
          });
        });
      } else {
        // Single person
        const xPosition = 400 + (groupIndex - (totalGroups - 1) / 2) * spacing;
        positionedMembers.push({
          ...group,
          position: { x: xPosition, y: yPosition }
        });
      }
    });
  });

  return positionedMembers;
};

/**
 * Get complete family tree data with structure
 */
export const getFamilyTreeData = async () => {
  try {
    // Get family members
    const { data: members, error: membersError } = await getFamilyMembers();
    if (membersError) throw membersError;

    // Get relationships
    const { data: relationships, error: relationshipsError } = await getFamilyRelationships();
    if (relationshipsError) throw relationshipsError;

    // Debug: Log marriage relationships
    const marriageRelationships = relationships.filter(r => r.relationship_type === 'spouse');
    console.log('Marriage relationships found:', marriageRelationships.length);
    marriageRelationships.forEach(rel => {
      const person1 = members.find(m => m.id === rel.person1_id);
      const person2 = members.find(m => m.id === rel.person2_id);
      console.log(`Marriage: ${person1?.name} ↔ ${person2?.name}`);
    });

    // Build tree structure
    const treeStructure = buildFamilyTree(members, relationships);

    return { 
      data: { members, relationships, treeStructure }, 
      error: null 
    };
  } catch (error) {
    console.error('Error fetching family tree data:', error);
    return { data: null, error };
  }
};

/**
 * Delete a family member and all their relationships
 */
export const deleteFamilyMemberAndRelationships = async (memberId) => {
  try {
    // First delete all relationships involving this person
    const { error: relationshipsError } = await supabase
      .from('family_relationships')
      .delete()
      .or(`person1_id.eq.${memberId},person2_id.eq.${memberId}`);

    if (relationshipsError) throw relationshipsError;

    // Then delete the family member
    const { error: memberError } = await deleteFamilyMember(memberId);
    if (memberError) throw memberError;

    return { error: null };
  } catch (error) {
    console.error('Error deleting family member and relationships:', error);
    return { error };
  }
};

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Transform database member to frontend format
 */
export const transformMemberForFrontend = (dbMember) => {
  return {
    id: dbMember.id,
    name: dbMember.full_name,
    birthYear: dbMember.birth_year?.toString(),
    deathYear: dbMember.death_year?.toString(),
    relationship: getRelationshipLabel(dbMember.gender, dbMember.birth_year),
    image: dbMember.profile_image_url,
    // Additional fields for future use
    firstName: dbMember.first_name,
    lastName: dbMember.last_name,
    middleName: dbMember.middle_name,
    gender: dbMember.gender,
    isLiving: dbMember.is_living,
    isDeceased: dbMember.is_deceased,
    bio: dbMember.bio,
    occupation: dbMember.occupation,
    location: dbMember.location,
    email: dbMember.email,
    phone: dbMember.phone
  };
};

/**
 * Transform frontend member to database format
 */
export const transformMemberForDatabase = (frontendMember) => {
  return {
    first_name: frontendMember.firstName || frontendMember.name?.split(' ')[0],
    last_name: frontendMember.lastName || frontendMember.name?.split(' ').slice(-1)[0],
    middle_name: frontendMember.middleName,
    birth_year: parseInt(frontendMember.birthYear),
    death_year: frontendMember.deathYear ? parseInt(frontendMember.deathYear) : null,
    gender: frontendMember.gender || 'prefer_not_to_say',
    profile_image_url: frontendMember.image,
    bio: frontendMember.bio,
    occupation: frontendMember.occupation,
    location: frontendMember.location,
    email: frontendMember.email,
    phone: frontendMember.phone,
    is_living: frontendMember.isLiving !== false,
    is_deceased: frontendMember.isDeceased || false
  };
};

/**
 * Get relationship label based on gender and birth year
 */
const getRelationshipLabel = (gender, birthYear) => {
  const currentYear = new Date().getFullYear();
  const age = currentYear - birthYear;
  
  if (age >= 60) {
    return gender === 'male' ? 'Grandfather' : 'Grandmother';
  } else if (age >= 30) {
    return gender === 'male' ? 'Father' : 'Mother';
  } else if (age >= 18) {
    return gender === 'male' ? 'Son' : 'Daughter';
  } else {
    return gender === 'male' ? 'Grandson' : 'Granddaughter';
  }
};

/**
 * Create relationship between two family members
 */
export const createRelationship = async (person1Id, person2Id, relationshipType, relationshipSubtype) => {
  const relationshipData = {
    person1_id: person1Id,
    person2_id: person2Id,
    relationship_type: relationshipType,
    relationship_subtype: relationshipSubtype,
    is_current: true
  };

  return await createFamilyRelationship(relationshipData);
};

// ========================================
// REACT HOOKS (if needed)
// ========================================

import { useState } from 'react';

/**
 * Custom hook for family tree data
 */
export const useFamilyTree = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [familyData, setFamilyData] = useState({ members: [], relationships: [] });

  const fetchFamilyTree = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await getFamilyTreeData();
      if (error) throw error;
      
      setFamilyData(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return {
    familyData,
    loading,
    error,
    fetchFamilyTree
  };
};
